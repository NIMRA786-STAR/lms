import toast from 'react-hot-toast';

const confirmStyle = {
  style: {
    borderRadius: 14,
    padding: '16px 18px',
    maxWidth: 420,
    fontWeight: 500,
  },
};

export const notify = {
  success: (msg: string) => toast.success(msg),
  error: (msg: string) => toast.error(msg),
  warning: (msg: string) => toast(msg, { icon: '⚠️', ...confirmStyle }),
  info: (msg: string) => toast(msg, { icon: 'ℹ️', ...confirmStyle }),

  confirm: (msg: string): Promise<boolean> =>
    new Promise((resolve) => {
      toast(
        (t) => (
          <div>
            <div style={{ marginBottom: 12, fontWeight: 500 }}>{msg}</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => { toast.dismiss(t.id); resolve(false); }}
                style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #cbd5e0', background: 'transparent', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => { toast.dismiss(t.id); resolve(true); }}
                style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
              >
                Confirm
              </button>
            </div>
          </div>
        ),
        { duration: 8000, style: { borderRadius: 14, padding: 16, maxWidth: 420 } }
      );
    }),
};

export default notify;