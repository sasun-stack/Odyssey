// TicketEmailStub — variant of the ticket email that LOOKS like a printed
// physical ticket: main body + perforated stub, monospace data, slight tilt.

const { useMemo: useMemoStub } = React;

// Inline QR (mirrors the api.qrserver.com pattern from ticket-email.jsx)
const StubQR = ({ value, size = 110, fg = '#0F0F0F', bg = '#FFFFFF' }) => {
  const fgHex = fg.replace('#', '');
  const bgHex = bg.replace('#', '');
  const px = size * 2;
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${px}x${px}&margin=2&data=${encodeURIComponent(value)}&color=${fgHex}&bgcolor=${bgHex}&ecc=M`;
  return <img src={url} alt="QR" width={size} height={size} style={{ display: 'block', imageRendering: 'pixelated' }} />;
};

// Small poster thumbnail — accepts real URL or shows designed placeholder
const PosterThumb = ({ src, title, width = 78, height = 110 }) => {
  if (src) {
    return (
      <div style={{ width, height, borderRadius: 4, overflow: 'hidden', background: '#000', flex: 'none' }}>
        <img src={src} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>);

  }
  return (
    <div style={{
      width, height, borderRadius: 4, flex: 'none',
      background: 'linear-gradient(135deg, #1B2A4E 0%, #6E2B2B 60%, #F26B1F 100%)',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.2)'
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 4px)'
      }} />
      <div style={{
        position: 'absolute', left: 6, right: 6, bottom: 6,
        color: '#fff', fontSize: 8, fontWeight: 700,
        letterSpacing: '0.06em', lineHeight: 1.1,
        textTransform: 'uppercase',
        fontFamily: '"Manrope", sans-serif'
      }}>
        {title}
      </div>
    </div>);

};

// =====================================================
// Physical ticket — VERTICAL, with stub at the bottom.
// No rotation; instead a strip of "washi tape" at the top
// + soft drop shadow + top-edge highlight give it a tactile,
// printed-and-pinned feel that still reads on mobile.
// =====================================================
const PhysicalTicket = ({ theme, data, pageBg }) => {
  // Distinct "paper" colors per theme, kept apart from the email card palette.
  const paper = theme === 'dark' ? {
    body: '#161616',
    stub: '#0E0E0E',
    ink: '#FFFFFF',
    inkMuted: 'rgba(255,255,255,0.62)',
    inkFaint: 'rgba(255,255,255,0.36)',
    divider: 'rgba(255,255,255,0.16)',
    qrPad: '#FFFFFF', // QR area stays white in both themes for scannability
    edge: 'rgba(255,255,255,0.06)',
    grain: 'rgba(255,255,255,0.02)'
  } : {
    body: '#FFFFFF', // clean white paper (no cream)
    stub: '#F4F4F2', // brighter than pageBg → clear contrast
    ink: '#0F0F0F',
    inkMuted: 'rgba(15,15,15,0.62)',
    inkFaint: 'rgba(15,15,15,0.42)',
    divider: 'rgba(15,15,15,0.16)',
    qrPad: '#FFFFFF',
    edge: 'rgba(15,15,15,0.06)',
    grain: 'rgba(0,0,0,0.025)'
  };

  const RADIUS = 16;
  const PERF_R = 10; // radius of the perforation cutouts (mask radius)

  // mono font used for "thermal printed" data
  const mono = '"JetBrains Mono", "SFMono-Regular", "Roboto Mono", Menlo, monospace';

  // Mask CSS: two radial-gradient holes at the corners.
  // mask-composite: intersect → only pixels black in BOTH masks remain visible.
  // Result: corner half-circles are cut out of the element.
  const bodyMask = `
    radial-gradient(circle ${PERF_R}px at 0% 100%, transparent ${PERF_R - 0.5}px, #000 ${PERF_R}px),
    radial-gradient(circle ${PERF_R}px at 100% 100%, transparent ${PERF_R - 0.5}px, #000 ${PERF_R}px)
  `;
  const stubMask = `
    radial-gradient(circle ${PERF_R}px at 0% 0%, transparent ${PERF_R - 0.5}px, #000 ${PERF_R}px),
    radial-gradient(circle ${PERF_R}px at 100% 0%, transparent ${PERF_R - 0.5}px, #000 ${PERF_R}px)
  `;
  const maskShared = {
    maskComposite: 'intersect',
    WebkitMaskComposite: 'source-in'
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      padding: '8px 0 20px',
      position: 'relative'
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 440,
        filter: theme === 'dark' ?
        // dark: warm-white hairline halo + soft glow + drop shadow
        [
          'drop-shadow(0 0 0.6px rgba(255,255,255,0.45))',
          'drop-shadow(0 0 18px rgba(255,255,255,0.04))',
          'drop-shadow(0 22px 42px rgba(0,0,0,0.55))'
        ].join(' ') :
        // light: ink hairline + softer shadow against gray bg
        [
          'drop-shadow(0 0 0.5px rgba(15,15,15,0.22))',
          'drop-shadow(0 16px 36px rgba(15,15,15,0.16))'
        ].join(' ')
      }}>
        {/* ============== MAIN BODY ============== */}
        <div style={{
          position: 'relative',
          background: paper.body,
          color: paper.ink,
          borderRadius: `${RADIUS}px ${RADIUS}px 0 0`,
          padding: '20px 22px 26px',
          boxSizing: 'border-box',
          backgroundImage: `radial-gradient(${paper.grain} 1px, transparent 1px)`,
          backgroundSize: '4px 4px',
          maskImage: bodyMask,
          WebkitMaskImage: bodyMask,
          ...maskShared
        }}>
          {/* Header strip */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: `1px dashed ${paper.divider}`,
            paddingBottom: 12,
            marginBottom: 16
          }}>
            <KPLogo mode={theme === 'dark' ? 'dark' : 'light'} height={20} />
            <div style={{
              fontFamily: mono, fontSize: 11, letterSpacing: '0.16em',
              color: paper.ink, textTransform: 'uppercase', fontWeight: 700
            }}>
              {data.date.toUpperCase()}
              <span style={{ color: paper.inkFaint, margin: '0 6px', fontWeight: 400 }}>·</span>
              <span style={{ color: BRAND.accent }}>{data.time}</span>
            </div>
          </div>

          {/* Poster — full width, 16:9 */}
          <div style={{
            width: '100%',
            aspectRatio: '16 / 9',
            borderRadius: 8,
            overflow: 'hidden',
            background: '#000',
            position: 'relative',
            boxShadow: `inset 0 0 0 1px ${paper.divider}`
          }}>
            {data.posterUrl ?
            <img src={data.posterUrl} alt={data.movieTitle}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> :

            <div style={{
              width: '100%', height: '100%',
              background: 'linear-gradient(135deg, #1B2A4E 0%, #6E2B2B 60%, #F26B1F 100%)',
              position: 'relative'
            }}>
                <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 5px)'
              }} />
                <div style={{
                position: 'absolute', left: 14, bottom: 12,
                fontSize: 10, letterSpacing: '0.22em',
                color: 'rgba(255,255,255,0.55)',
                textTransform: 'uppercase',
                fontFamily: '"Manrope", sans-serif'
              }}>
                  POSTER · 16:9
                </div>
              </div>
            }
          </div>

          {/* Title */}
          <h3 style={{
            margin: '16px 0 6px',
            fontFamily: '"Noto Sans Armenian", "Manrope", sans-serif',
            fontWeight: 800, fontSize: 24, lineHeight: 1.1,
            letterSpacing: '-0.015em', color: paper.ink
          }}>
            {data.movieTitle}
          </h3>
          <div style={{
            fontSize: 12, color: paper.inkMuted,
            fontFamily: '"Noto Sans Armenian", sans-serif',
            marginBottom: 16
          }}>
            {data.genre} · {data.meta.join(' · ')}
          </div>

          {/* Thermal-printed data block (date moved to header) */}
          <div style={{
            fontFamily: mono,
            fontSize: 11.5,
            lineHeight: 1.65,
            borderTop: `1px dashed ${paper.divider}`,
            borderBottom: `1px dashed ${paper.divider}`,
            padding: '12px 0',
            display: 'grid',
            gridTemplateColumns: '78px 1fr',
            rowGap: 2
          }}>
            <span style={{ color: paper.inkFaint, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Սրահ</span>
            <span style={{ color: paper.ink, fontWeight: 700, letterSpacing: '0.02em' }}>
              {data.hall.toUpperCase()}
              <span style={{ color: paper.inkFaint, margin: '0 8px' }}>·</span>
              <span style={{ color: paper.ink }}>{data.duration}</span>
            </span>

            <span style={{ color: paper.inkFaint, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Տեղեր</span>
            <span style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
              {data.seats.map((s, i) =>
              <span key={i} style={{ ...{
                  display: 'inline-flex',
                  padding: '2px 8px',
                  border: `1px solid ${paper.divider}`,
                  borderRadius: 4,
                  color: paper.ink,
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: '0.04em'
                }, border: "1px dotted rgba(15, 15, 15, 0.16)", justifyContent: "flex-end" }}>
                  R{s.row}<span style={{ color: paper.inkFaint, margin: '0 4px' }}>·</span>S{s.seat}
                </span>
              )}
            </span>
          </div>

          {/* Subtle "printed" footer */}
          <div style={{
            marginTop: 10,
            fontFamily: mono, fontSize: 9,
            letterSpacing: '0.18em',
            color: paper.inkFaint,
            textTransform: 'uppercase',
            display: 'flex', justifyContent: 'space-between'
          }}>
            <span>KP · YEREVAN MALL</span>
            <span>e-Ticket</span>
          </div>
        </div>

        {/* ============== PERFORATION DASHED LINE ============== */}
        {/* The corner cutouts are produced by CSS masks on the body
              (bottom corners) and stub (top corners). At the seam, the two
              half-circles meet to form full circular holes on the left/right
              edges. This dashed line spans across the seam between them. */}
        <div style={{
          position: 'relative',
          height: 0,
          zIndex: 1,
          pointerEvents: 'none'
        }}>
          <div style={{
            position: 'absolute',
            left: PERF_R + 4,
            right: PERF_R + 4,
            top: -1,
            height: 2,
            backgroundImage: `linear-gradient(to right, ${paper.divider} 50%, transparent 50%)`,
            backgroundSize: '8px 2px',
            backgroundRepeat: 'repeat-x'
          }} />
        </div>

        {/* ============== STUB (bottom) ============== */}
        <div style={{
          position: 'relative',
          background: paper.stub,
          color: paper.ink,
          borderRadius: `0 0 ${RADIUS}px ${RADIUS}px`,
          padding: '22px 22px 22px',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 18,
          backgroundImage: `radial-gradient(${paper.grain} 1px, transparent 1px)`,
          backgroundSize: '4px 4px',
          maskImage: stubMask,
          WebkitMaskImage: stubMask,
          ...maskShared
        }}>
          {/* QR on white pad */}
          <div style={{
            background: paper.qrPad,
            padding: 8,
            borderRadius: 8,
            flex: 'none',
            boxShadow: theme === 'dark' ? '0 0 0 1px rgba(255,255,255,0.06)' : '0 0 0 1px rgba(15,15,15,0.06)'
          }}>
            <StubQR value={data.qrPayload} size={120} fg="#0F0F0F" bg="#FFFFFF" />
          </div>

          {/* Right column: labels + order */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <div style={{
                fontFamily: mono, fontSize: 9, letterSpacing: '0.28em',
                color: paper.inkFaint, textTransform: 'uppercase',
                marginBottom: 4
              }}>
                Մուտք
              </div>
              <div style={{
                fontFamily: '"Manrope", sans-serif',
                fontSize: 28, fontWeight: 800, lineHeight: 1, color: paper.ink,
                letterSpacing: '-0.02em'
              }}>
                {data.seats.length}
                <span style={{
                  fontSize: 13, fontWeight: 600, color: paper.inkMuted,
                  marginLeft: 6, letterSpacing: 0,
                  fontFamily: '"Noto Sans Armenian", sans-serif'
                }}>
                  {data.seats.length === 1 ? 'տոմս' : 'տոմս'}
                </span>
              </div>
            </div>

            <div style={{
              borderTop: `1px dashed ${paper.divider}`,
              paddingTop: 8
            }}>
              <div style={{
                fontFamily: mono, fontSize: 9, letterSpacing: '0.22em',
                color: paper.inkFaint, textTransform: 'uppercase',
                marginBottom: 4
              }}>
                Խորտիկներ
              </div>
              {data.concession && data.concession.length > 0 ?
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 2,
                fontFamily: mono, fontSize: 11, fontWeight: 700,
                color: paper.ink, letterSpacing: '0.02em'
              }}>
                  {data.concession.map((c, i) =>
                <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ color: BRAND.accent, minWidth: 22 }}>{c.qty}×</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.name}
                      </span>
                    </div>
                )}
                </div> :

              <div style={{
                fontFamily: mono, fontSize: 11, fontWeight: 600,
                color: paper.inkFaint, letterSpacing: '0.04em'
              }}>
                  — none
                </div>
              }
            </div>

            <div style={{
              fontFamily: '"Noto Sans Armenian", "Manrope", sans-serif',
              fontSize: 11, color: paper.inkMuted, lineHeight: 1.4
            }}>
              Ցույց տուր QR-ը մուտքի մոտ
            </div>
          </div>
        </div>
      </div>
    </div>);

};

// =====================================================
// Full email layout using physical ticket variant
// =====================================================
const TicketEmailStub = ({ theme = 'light', data, width = 600, compact = false }) => {
  const t = THEMES[theme];

  return (
    <div style={{
      width,
      background: t.pageBg,
      padding: compact ? '20px 16px 0' : '36px 24px 0',
      fontFamily: '"Noto Sans Armenian", "Manrope", system-ui, sans-serif',
      color: t.ink,
      lineHeight: 1.4
    }}>
      {!compact && <>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <KPLogo mode={theme === 'dark' ? 'dark' : 'light'} height={26} />
        </div>

        {/* Headline */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{
            margin: 0, fontSize: 32, fontWeight: 700,
            letterSpacing: '-0.02em', lineHeight: 1.1, color: t.ink
          }}>
            Ողջույն{data.firstName ? `, ${data.firstName}` : ''}
          </h1>
          <p style={{
            margin: '12px auto 0', fontSize: 15, maxWidth: 380,
            color: t.inkMuted, lineHeight: 1.5
          }}>
            Ձեր տոմսը պատրաստ է։ Ցույց տուր QR կոդը դահլիճի մուտքի մոտ։
          </p>
        </div>
      </>}

      {/* The actual physical ticket */}
      <PhysicalTicket theme={theme} data={data} pageBg={t.pageBg} />

      {/* Tiny callout under the ticket */}
      <div style={{
        textAlign: 'center', fontSize: 11,
        color: t.inkFaint, letterSpacing: '0.08em', textTransform: 'uppercase',
        marginBottom: 28,
        fontFamily: '"Manrope", monospace'
      }}>
        ── e-Ticket · save this email ──
      </div>

      {/* CTA */}
      <a href={data.calendarUrl} target="_blank" rel="noopener noreferrer" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, padding: '18px 24px',
        background: BRAND.accent, color: '#fff',
        borderRadius: 14, fontSize: 16, fontWeight: 700,
        letterSpacing: '-0.005em', textDecoration: 'none',
        boxShadow: '0 8px 24px -8px rgba(242,107,31,0.5)',
        fontFamily: '"Noto Sans Armenian", "Manrope", sans-serif'
      }}>
        <Icon.Calendar size={20} color="#fff" />
        Ավելացնել օրացույցում
      </a>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10
      }}>
        <a href="#" style={{
          padding: '14px 16px', borderRadius: 12,
          border: `1px solid ${t.chipBorder}`, background: 'transparent',
          color: t.ink, fontSize: 13, fontWeight: 600,
          textDecoration: 'none', textAlign: 'center'
        }}>Իմ պատվերները</a>
        <a href="#" style={{
          padding: '14px 16px', borderRadius: 12,
          border: `1px solid ${t.chipBorder}`, background: 'transparent',
          color: t.ink, fontSize: 13, fontWeight: 600,
          textDecoration: 'none', textAlign: 'center'
        }}>Օգնության կենտրոն</a>
      </div>

      {/* Location hint */}
      <div style={{
        marginTop: 22, padding: '14px 16px', borderRadius: 12,
        background: 'transparent', border: `1px dashed ${t.divider}`,
        display: 'flex', alignItems: 'flex-start', gap: 10
      }}>
        <div style={{ marginTop: 2, color: t.inkMuted }}>
          <Icon.Pin size={16} color={t.inkMuted} />
        </div>
        <div style={{ flex: 1, fontSize: 12, color: t.inkMuted, lineHeight: 1.5 }}>
          <div style={{ color: t.ink, fontWeight: 700, marginBottom: 2 }}>ԿինոՊարկ · Yerevan Mall</div>
          Արշակունյաց պող. 34/3, 3-րդ հարկ։ Խորհուրդ ենք տալիս ժամանել 15 րոպե շուտ։
        </div>
      </div>

      {/* Footer */}
      <div style={{
        margin: '32px -24px 0', padding: '28px 28px 32px',
        background: t.footerBg, color: t.footerInk
      }}>
        <div style={{ marginBottom: 16 }}>
          <KPLogo mode="dark" height={22} />
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.6, color: t.footerInk }}>
          Այս նամակը ուղարկվել է ավտոմատ եղանակով գործարք № {data.orderNumber}-ի վերաբերյալ։
          Տոմսի վերադարձի կամ փոխանակման հարցերով դիմել{' '}
          <a href="mailto:info@kinopark.am" style={{ color: '#fff', textDecoration: 'underline' }}>info@kinopark.am</a>։
        </div>
        <div style={{
          marginTop: 18, paddingTop: 16,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', justifyContent: 'space-between',
          fontSize: 11, color: t.footerInkFaint
        }}>
          <span>© KinoPark {new Date().getFullYear()}</span>
          <span>kinopark.am</span>
        </div>
      </div>
    </div>);

};

window.TicketEmailStub = TicketEmailStub;
window.PhysicalTicket = PhysicalTicket;