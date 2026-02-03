// filepath: c:\xampp\htdocs\3D-School-Attendance\src\components\Modal.jsx
// Enhanced Modal (ported from Websitereactvite, adapted for global React in browser)
function Modal({
  show,
  title,
  size = "md", // "sm" | "md" | "lg"
  onClose,
  children,
  closeOnBackdrop = true,
}) {
  // Always call hooks, only do work when show === true
  React.useEffect(() => {
    if (!show) return;

    const handleEsc = (e) => {
      if (e.key === "Escape" && onClose) onClose();
    };

    document.addEventListener("keydown", handleEsc);
    document.body.classList.add("modal-open");

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.classList.remove("modal-open");
    };
  }, [show, onClose]);

  if (!show) return null;

  const handleBackdropClick = (e) => {
    if (!closeOnBackdrop) return;
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  let widthClass = "";
  if (size === "lg") widthClass = "modal-lg";
  if (size === "sm") widthClass = "modal-sm";

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      onClick={handleBackdropClick}
      style={{
        backgroundColor: "rgba(15,23,42,0.45)",
        backdropFilter: "blur(3px)",
      }}
    >
      <div
        className={`modal-dialog modal-dialog-centered ${widthClass}`}
        style={
          size === "lg"
            ? {
                maxWidth: "1400px",
                width: "95vw",
                margin: "0 auto",
              }
            : undefined
        }
      >
        <div
          className="modal-content"
          style={{
            borderRadius: 16,
            border: "1px solid #e5e7eb",
            boxShadow: "0 18px 45px rgba(15,23,42,0.18)",
          }}
        >
          {title && (
            <div
              className="modal-header"
              style={{
                borderBottom: "1px solid #e5e7eb",
                padding: "12px 18px",
                background: "#f9fafb",
              }}
            >
              <h5 className="modal-title mb-0" style={{ fontWeight: 600 }}>
                {title}
              </h5>
              {onClose && (
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={onClose}
                  style={{ filter: "invert(40%)" }}
                />
              )}
            </div>
          )}

          <div
            className="modal-body"
            style={{ padding: "16px 18px 18px", background: "#ffffff" }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// expose globally for legacy scripts that expect window.Modal
try { if (typeof window !== 'undefined' && !window.Modal) window.Modal = Modal; } catch (e) {}

// export as ES module default (do not attach to window)
export default Modal;
