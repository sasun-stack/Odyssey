// MailScreen — renders the ticket email INSIDE an iPhone, with a
// faux Mail-app header (sender, subject, date) above the message body.

const MailScreen = ({ theme = 'light', data, compact = false }) => {
  const t = window.THEMES[theme];
  const PHONE_W = 390;
  const PHONE_H = 844;

  // The Mail app itself is always light by default on most users' phones.
  // But our content theme determines the email itself.
  // Status bar / device chrome: light bg behind email so it doesn't fight.

  // Mail header colors — independent of email theme; tied to phone OS.
  const mailHdrBg     = '#FFFFFF';
  const mailHdrInk    = '#0F0F0F';
  const mailHdrMuted  = 'rgba(15,15,15,0.55)';
  const mailHdrFaint  = 'rgba(15,15,15,0.42)';
  const mailHdrDiv    = 'rgba(15,15,15,0.08)';

  return (
    <div
      data-dc-allow-scroll="true"
      style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
      <IOSDevice
        width={PHONE_W}
        height={PHONE_H}
        dark={false}
      >
        {/* Scrollable content area (IOSDevice already wraps in overflow:auto) */}
        <div style={{
          paddingTop: 56, // clear status bar + dynamic island
          background: mailHdrBg,
        }}>
          {/* Mail nav bar mock */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '6px 16px 4px',
            fontFamily: '-apple-system, system-ui, sans-serif',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              color: '#0A84FF', fontSize: 17, fontWeight: 400,
            }}>
              <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
                <path d="M10 1 L2 10 L10 19" stroke="#0A84FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ marginLeft: -2 }}>Inbox</span>
              <span style={{
                marginLeft: 6, padding: '2px 7px', background: '#FF3B30',
                color: '#fff', fontSize: 12, fontWeight: 600, borderRadius: 10,
                minWidth: 18, textAlign: 'center',
              }}>4</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, color: '#0A84FF' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M5 12l4-4M5 12l4 4" stroke="#0A84FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M5 12l4-4M5 12l4 4" stroke="#0A84FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'scaleX(-1)', transformOrigin: 'center' }} />
              </svg>
            </div>
          </div>

          {/* Mail header — sender, subject, date */}
          <div style={{
            padding: '8px 16px 14px',
            borderBottom: `0.5px solid ${mailHdrDiv}`,
            fontFamily: '-apple-system, system-ui, sans-serif',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              {/* Avatar with KP icon */}
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: '#0F0F0F',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flex: 'none',
              }}>
                <KPLogo iconOnly mode="dark" height={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                  gap: 8,
                }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: mailHdrInk }}>
                    KinoPark
                  </span>
                  <span style={{ fontSize: 14, color: mailHdrMuted, flex: 'none' }}>
                    9:41
                    <svg width="9" height="14" viewBox="0 0 9 14" style={{ marginLeft: 4, verticalAlign: 'middle' }}>
                      <path d="M2 2l5 5-5 5" stroke={mailHdrFaint} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
                <div style={{ fontSize: 14, color: mailHdrMuted, marginTop: 1 }}>
                  to me <span style={{ color: mailHdrFaint }}>›</span>
                </div>
                <div style={{
                  fontSize: 15, fontWeight: 600, color: mailHdrInk,
                  marginTop: 6, lineHeight: 1.3,
                }}>
                  Ձեր տոմսը՝ {data.movieTitle} · {data.date}, {data.time}
                </div>
              </div>
            </div>
          </div>

          {/* Email body itself */}
          <TicketEmailStub theme={theme} data={data} width={PHONE_W} compact={compact} />

          {/* Spacer for bottom action bar */}
          <div style={{ height: 60, background: t.footerBg }} />
        </div>

        {/* Mail action bar (absolute over content) */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          height: 60, zIndex: 55, pointerEvents: 'none',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: `0.5px solid ${mailHdrDiv}`,
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          paddingBottom: 12,
        }}>
          {['flag', 'folder', 'trash', 'reply', 'compose'].map((icon) => (
            <div key={icon} style={{ width: 28, height: 28, color: '#0A84FF' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                {icon === 'flag' && <path d="M5 3v18M5 4h12l-2 5 2 5H5" stroke="#0A84FF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />}
                {icon === 'folder' && <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="#0A84FF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />}
                {icon === 'trash' && <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" stroke="#0A84FF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />}
                {icon === 'reply' && <path d="M9 6 3 12l6 6M3 12h12a6 6 0 0 1 6 6" stroke="#0A84FF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />}
                {icon === 'compose' && <path d="M16 4l4 4-10 10H6v-4l10-10Z" stroke="#0A84FF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />}
              </svg>
            </div>
          ))}
        </div>
      </IOSDevice>
    </div>
  );
};

window.MailScreen = MailScreen;
