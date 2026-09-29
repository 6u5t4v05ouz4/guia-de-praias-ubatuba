import { useEffect, useMemo, useState } from 'react';
import type { Beach } from '@/types';
import { beachArtDataUrl } from '@/assets/beachArt';
import { compressImage, formatBytes } from '@/services/image';
import { beachesRepo, photosRepo } from '@/services/repository';
import { uploadImage, UploadError } from '@/services/uploads';
import type { CompressionResult } from '@/services/image';
import { Modal } from './Modal';
import './PhotoUploadModal.css';

interface PhotoUploadModalProps {
  open: boolean;
  onClose: () => void;
  /** Praia já pré-selecionada quando o modal é aberto a partir da página dela. */
  beachId?: string;
  onSubmitted: (message: string) => void;
}

/**
 * Envio colaborativo de fotos (SPEC §5).
 *
 * Sem cadastro: o usuário escolhe a praia, a foto, o nome e o @Instagram.
 * A imagem é comprimida no cliente antes de qualquer coisa — é o que mantém
 * o envio viável no 4G instável da praia e o que cabe no localStorage.
 */
export function PhotoUploadModal({
  open,
  onClose,
  beachId,
  onSubmitted,
}: PhotoUploadModalProps) {
  const [selectedBeach, setSelectedBeach] = useState(beachId ?? '');
  const [author, setAuthor] = useState('');
  const [instagram, setInstagram] = useState('');
  const [preview, setPreview] = useState<CompressionResult | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<Beach[]>([]);

  // Re-sincroniza a praia a cada abertura (pode vir pré-selecionada da página).
  useEffect(() => {
    if (open) {
      setSelectedBeach(beachId ?? '');
      setError(null);
    }
  }, [open, beachId]);

  // A lista vem do repositório, não do catálogo semente: beaches criadas no
  // /admin também precisam aparecer aqui.
  useEffect(() => {
    if (!open) return;
    void beachesRepo.list().then((list) => setCatalog(list));
  }, [open]);

  const sortedBeaches = useMemo(
    () => [...catalog].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [catalog]
  );

  /**
   * Praia usada só como referência visual (arte de fundo no seletor) e no texto
   * de confirmação. É `undefined` enquanto o catálogo não carregou ou se o
   * usuário não escolheu nenhuma — daí o `?? catalog[0]` sem cast: `catalog[0]`
   * de um array vazio é `undefined`, e nunca um objeto pela metade.
   */
  const hintBeach = catalog.find((b) => b.id === selectedBeach) ?? catalog[0];

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem (JPG ou PNG).');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError('A imagem é muito grande (máximo 25 MB).');
      return;
    }
    setBusy(true);
    try {
      const result = await compressImage(file);
      if (!result.dataUrl) {
        setError('Não foi possível processar essa imagem. Tente outra.');
        return;
      }
      setPreview(result);
      setSourceFile(file);
    } catch {
      setError('Falha ao processar a imagem. Tente outra.');
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setAuthor('');
    setInstagram('');
    setPreview(null);
    setSourceFile(null);
    setError(null);
    setBusy(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedBeach) return setError('Escolha a praia da foto.');
    if (author.trim().length < 2) return setError('Digite seu nome (mínimo 2 letras).');
    if (!preview?.dataUrl || !sourceFile) return setError('Escolha uma foto.');

    setBusy(true);
    try {
      const upload = await uploadImage(sourceFile, 'ugc');
      await photosRepo.submit({
        beachId: selectedBeach,
        imageUrl: upload.url,
        authorName: author,
        authorInstagram: instagram.startsWith('@') ? instagram : `@${instagram}`,
      });
      onSubmitted(
        `Foto enviada para moderação! Ela aparece em ${
          hintBeach?.name ?? 'sua praia'
        } assim que for aprovada.`
      );
      reset();
      onClose();
    } catch (err) {
      setError(
        err instanceof UploadError
          ? err.message
          : 'Não foi possível enviar agora. Tente novamente em instantes.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="📸 Enviar foto da praia"
      subtitle="Sem cadastro. A foto passa por moderação antes de aparecer no guia."
      footer={
        <>
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            form="photo-upload-form"
            className="btn btn--primary"
            disabled={busy}
          >
            {busy ? 'Enviando…' : 'Enviar foto'}
          </button>
        </>
      }
    >
      <form id="photo-upload-form" className="stack stack-4" onSubmit={handleSubmit}>
        <div className="field">
          <label className="field__label" htmlFor="pu-beach">
            Praia
          </label>
          <select
            id="pu-beach"
            className="select"
            value={selectedBeach}
            onChange={(e) => setSelectedBeach(e.target.value)}
            required
          >
            <option value="">Selecione…</option>
            {sortedBeaches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.region})
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <span className="field__label">Foto</span>
          <label className="photo-drop" htmlFor="pu-file">
            {preview ? (
              <img className="photo-drop__preview" src={preview.dataUrl} alt="Pré-visualização" />
            ) : (
              <div className="photo-drop__empty">
                {/* Mostra a arte da praia selecionada: dá contexto de onde a foto é. */}
                {hintBeach && (
                  <img
                    className="photo-drop__hint"
                    src={beachArtDataUrl(hintBeach)}
                    alt=""
                    aria-hidden="true"
                  />
                )}
                <span className="photo-drop__icon" aria-hidden="true">
                  🖼️
                </span>
                <strong>Toque para escolher uma foto</strong>
                <span className="field__hint">
                  JPG ou PNG até 25 MB. Comprimimos automaticamente para ficar leve no 4G.
                </span>
              </div>
            )}
          </label>
          <input
            id="pu-file"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
          {preview && (
            <span className="field__hint">
              {preview.width}×{preview.height}px · {formatBytes(preview.bytes)} após compressão
            </span>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="pu-author">
            Seu nome
          </label>
          <input
            id="pu-author"
            className="input"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Como quer ser creditado"
            maxLength={60}
            required
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="pu-ig">
            Instagram (opcional)
          </label>
          <input
            id="pu-ig"
            className="input"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@seuperfil"
            maxLength={40}
          />
          <span className="field__hint">
            A foto aparece com seu crédito, e o perfil ganha destaque na página da praia.
          </span>
        </div>

        {error && <p className="field__error">⚠️ {error}</p>}
      </form>
    </Modal>
  );
}
