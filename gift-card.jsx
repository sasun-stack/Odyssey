// GiftCardConfirmation — KinoPark gift card purchase confirmation
// Reuses the visual system from TicketEmail (theme tokens, logo, icons, chips, info cells)
// but is a separate component — NO text or data is laid on top of the card artwork itself.

const { useState: useGCState } = React;

// ============================================================
// Gift card artwork (decorative only — NO text overlay)
// Composed from the KP brand lollipop circles + subtle film grain.
// Card aspect ratio: 1.586:1 (ISO/IEC 7810 ID-1, standard credit card)
// ============================================================
const GiftCardArt = ({ theme, variant = 'noir' }) => {
  // Variants are purely visual — content stays the same, look changes.
  // All variants are clean, no copy.
  const variants = {
    // Cinematic noir — deep ink with the lollipops in a moody key-light cluster
    noir: {
      bg: 'radial-gradient(120% 80% at 12% 18%, #18150F 0%, #0E0E0E 60%, #080808 100%)',
      vignette: 'radial-gradient(120% 100% at 90% 100%, rgba(242,107,31,0.10), transparent 60%)',
      ink: '#FFFFFF',
      mode: 'dark'
    },
    // Sunset — KP orange forward; the brand's warm signature
    sunset: {
      bg: 'linear-gradient(135deg, #1F0E04 0%, #4A1F08 45%, #B5501A 100%)',
      vignette: 'radial-gradient(80% 100% at 20% 10%, rgba(255,255,255,0.04), transparent 60%)',
      ink: '#FFFFFF',
      mode: 'dark'
    },
    // Cream-paper free; soft neutral with brand circles
    paper: {
      bg: 'linear-gradient(135deg, #FAFAFA 0%, #EDEDED 100%)',
      vignette: 'radial-gradient(80% 90% at 80% 100%, rgba(242,107,31,0.06), transparent 65%)',
      ink: '#0F0F0F',
      mode: 'light'
    }
  };
  const v = variants[variant] || variants.noir;

  return (
    <div style={{
      position: 'relative',
      width: 271,
      height: 170.18,
      margin: '0 auto',
      borderRadius: 18,
      overflow: 'hidden',
      background: v.bg,
      boxShadow: v.mode === 'dark' ?
      '0 1px 0 rgba(255,255,255,0.04) inset, 0 0 0 1px rgba(255,255,255,0.04), 0 16px 36px -20px rgba(0,0,0,0.35)' :
      '0 1px 0 rgba(255,255,255,0.6) inset, 0 0 0 1px rgba(15,15,15,0.06), 0 12px 28px -18px rgba(15,15,15,0.12)'
    }}>
      {/* Soft warm vignette */}
      <div style={{ position: 'absolute', inset: 0, background: v.vignette, pointerEvents: 'none' }} />

      {/* Fine film grain */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: v.mode === 'dark' ? 0.5 : 0.25,
        backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 4px)'
      }} />

      {/* Hairline edge highlight */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 18, pointerEvents: 'none',
        boxShadow: v.mode === 'dark' ?
        'inset 0 1px 0 rgba(255,255,255,0.08)' :
        'inset 0 1px 0 rgba(255,255,255,0.9)'
      }} />

      {/* KP lollipop cluster — oversized + bleeding off the right edge.
                                                                                                        Purely decorative; visually anchors the card. */}
      <div style={{
        position: 'absolute',
        right: '-12%',
        bottom: '-26%',
        width: '78%',
        opacity: v.mode === 'dark' ? 0.95 : 0.92,
        filter: v.mode === 'dark' ?
        'drop-shadow(0 12px 32px rgba(0,0,0,0.45))' :
        'drop-shadow(0 8px 22px rgba(15,15,15,0.18))'
      }}>
        <svg viewBox="0 0 44 29" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
          <circle cx="36.0608" cy="19.054" r="5.95047" fill="#E6652C" />
          <circle cx="26.7311" cy="16.6045" r="8.40002" fill="#FDB73A" />
          <circle cx="12.6072" cy="12.9041" r="12.1004" fill="#73A050" />
          <path d="M12.6074 17.9074V28.0183M26.4187 20.6037V28.0183M36.1648 23.8688V28.0183"
          stroke={v.ink} strokeWidth="0.4" opacity="0.7" />
        </svg>
      </div>

      {/* Tiny corner accent — diagonal ribbon, NO text */}
      <div style={{
        position: 'absolute',
        top: 18, left: 18,
        display: 'flex', alignItems: 'center', gap: 6
      }}>
        <div style={{
          width: 28, height: 2, background: BRAND.accent, borderRadius: 1,
          boxShadow: '0 0 8px rgba(242,107,31,0.6)'
        }} />
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: BRAND.accent }} />
      </div>
    </div>);

};

// ============================================================
// Success checkmark (animated halo)
// ============================================================
const SuccessBadge = ({ theme }) => {
  const t = THEMES[theme];
  return (
    <div style={{
      position: 'relative',
      width: 64, height: 64,
      borderRadius: '50%',
      background: BRAND.accent,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: theme === 'dark' ?
      '0 0 0 6px rgba(242,107,31,0.14), 0 12px 32px -8px rgba(242,107,31,0.55)' :
      '0 0 0 6px rgba(242,107,31,0.12), 0 12px 28px -8px rgba(242,107,31,0.45)'
    }}>
      <Icon.Check size={28} color="#FFFFFF" />
    </div>);

};

// ============================================================
// Info row — label / value (used in stacked list block)
// ============================================================
const GCInfoRow = ({ label, value, theme, mono = false, accent = false, last = false }) => {
  const t = THEMES[theme];
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 20px',
      borderBottom: last ? 'none' : `1px solid ${t.divider}`,
      gap: 16
    }}>
      <span style={{
        fontSize: 12, fontWeight: 500,
        letterSpacing: '0.04em', textTransform: 'uppercase',
        color: t.inkFaint
      }}>
        {label}
      </span>
      <span style={{
        fontSize: mono ? 14 : 15,
        fontWeight: 700,
        color: accent ? BRAND.accent : t.ink,
        letterSpacing: mono ? '0.06em' : '-0.005em',
        fontFamily: mono ?
        '"JetBrains Mono", "SFMono-Regular", "Roboto Mono", Menlo, monospace' :
        '"Manrope", "Noto Sans Armenian", sans-serif',
        textAlign: 'right',
        maxWidth: '60%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {value}
      </span>
    </div>);

};

// ============================================================
// Big balance display (the "headline number")
// ============================================================
const BalanceBlock = ({ amount, currency = '֏', theme }) => {
  const t = THEMES[theme];
  return (
    <div style={{
      padding: '22px 20px 24px',
      borderBottom: `1px solid ${t.divider}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center'
    }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 6,
        fontFamily: '"Manrope", sans-serif'
      }}>
        <span style={{
          fontSize: 44, fontWeight: 800,
          letterSpacing: '-0.03em', lineHeight: 1,
          color: t.ink,
          fontVariantNumeric: 'tabular-nums'
        }}>
          {amount.toLocaleString('en-US')}
        </span>
        <span style={{
          fontSize: 22, fontWeight: 700,
          color: BRAND.accent, lineHeight: 1
        }}>
          {currency}
        </span>
      </div>
      <div style={{
        marginTop: 8,
        fontSize: 12,
        color: t.inkMuted,
        fontFamily: '"Noto Sans Armenian", sans-serif'
      }}>Օգտագործիր ԿինոՊարկում ցանկացած գործարքի համար

      </div>
    </div>);

};

// ============================================================
// Activation stub CONTENT — left: code + copy button (replaces the
// ticket's QR); right: balance + recipient + redeem instruction.
// Rendered inside the merged ticket's stub half (no own card chrome).
// ============================================================
const GiftCardStub = ({ data, theme, paper, layout = 'split' }) => {
  const t = THEMES[theme];
  const [copied, setCopied] = useGCState(false);

  const mono = '"JetBrains Mono", "SFMono-Regular", "Roboto Mono", Menlo, monospace';

  const handleCopy = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(data.code);
      }
    } catch (e) {/* clipboard not available */}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // ── Banner layout: code spans full width on top, balance + recipient
  //    sit in a 2-col row below. Same fields, different presentation. ──
  if (layout === 'banner') {
    // Split the code into its hyphen segments for a more "redeemable" look.
    const segs = String(data.code).split('-');
    return (
      <>
        {/* Code banner */}
        <div style={{
          background: paper.codeBg,
          border: `1px dashed ${paper.divider}`,
          borderRadius: 12,
          padding: '16px 16px 14px'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 12
          }}>
            <span style={{
              fontFamily: mono, letterSpacing: '0.26em',
              color: paper.inkFaint, textTransform: 'uppercase', fontSize: "10px"
            }}>
              Ակտիվացման կոդ
            </span>
            <button
              onClick={handleCopy}
              aria-label="Պատճենել կոդը"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 10px', borderRadius: 8,
                border: copied ? `1px solid ${BRAND.accent}` : `1px solid ${paper.divider}`,
                background: copied ? BRAND.accent : 'transparent',
                color: copied ? '#fff' : paper.inkMuted,
                fontSize: 11, fontWeight: 700, cursor: 'pointer',
                fontFamily: '"Noto Sans Armenian", "Manrope", sans-serif',
                transition: 'background .15s, color .15s, border-color .15s',
                WebkitTapHighlightColor: 'transparent'
              }}>
              {copied ?
              <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5 10 17.5 19.5 7" />
                  </svg>
                  Պատճենված
                </> :

              <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Պատճենել
                </>
              }
            </button>
          </div>
          {/* Segmented code */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap'
          }}>
            {segs.map((seg, i) =>
            <React.Fragment key={i}>
                <span style={{
                fontFamily: mono, fontSize: 19, fontWeight: 700,
                color: paper.ink, letterSpacing: '0.08em'
              }}>
                  {seg}
                </span>
                {i < segs.length - 1 &&
              <span style={{ color: paper.inkFaint, fontSize: 14 }}>·</span>
              }
              </React.Fragment>
            )}
          </div>
        </div>

        {/* Balance + recipient row */}
        <div style={{
          display: 'flex', alignItems: 'stretch',
          borderTop: `1px dashed ${paper.divider}`,
          paddingTop: 14
        }}>
          <div style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
            <div style={{
              fontFamily: mono, letterSpacing: '0.26em',
              color: paper.inkFaint, textTransform: 'uppercase', marginBottom: 5, fontSize: '10px'
            }}>
              Գումար
            </div>
            <div style={{
              display: 'flex', alignItems: 'baseline', gap: 6,
              fontFamily: '"Manrope", sans-serif'
            }}>
              <span style={{
                fontSize: 28, fontWeight: 800, lineHeight: 1, color: paper.ink,
                letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums'
              }}>
                {data.balance.toLocaleString('en-US')}
              </span>
              <span style={{ fontSize: 16, fontWeight: 700, color: BRAND.accent, lineHeight: 1 }}>֏</span>
            </div>
          </div>
          <div style={{
            flex: 1, minWidth: 0, paddingLeft: 16,
            borderLeft: `1px solid ${paper.divider}`,
            display: 'flex', flexDirection: 'column', justifyContent: 'center'
          }}>
            <div style={{
              fontFamily: mono, letterSpacing: '0.22em',
              color: paper.inkFaint, textTransform: 'uppercase', marginBottom: 4, fontSize: '10px'
            }}>
              Ստացող
            </div>
            <div style={{
              fontSize: 14, fontWeight: 700, color: paper.ink,
              fontFamily: '"Noto Sans Armenian", "Manrope", sans-serif',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>
              {data.recipient.name}
            </div>
          </div>
        </div>
      </>);

  }

  // ── Default split layout: code box + copy on left, balance/recipient right ──
  return (
    <>
      {/* ── Code + copy button (full width; balance/recipient live in the gift tag above) ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{
          background: paper.codeBg,
          border: `1px dashed ${paper.divider}`,

          padding: '16px 12px',
          textAlign: 'center', borderRadius: "14px"
        }}>
          <div style={{
            fontFamily: mono, letterSpacing: '0.26em',
            color: paper.inkFaint, textTransform: 'uppercase', marginBottom: 8, fontSize: "10px"
          }}>
            Ակտիվացման կոդ
          </div>
          <div style={{
            fontFamily: mono, fontSize: 20, fontWeight: 700,
            color: paper.ink, letterSpacing: '0.08em', lineHeight: 1.4
          }}>
            {data.code}
          </div>
        </div>
        <button
          onClick={handleCopy}
          style={{ ...{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '13px 12px',
              borderRadius: 10,
              border: copied ? `1px solid ${BRAND.accent}` : `1px solid ${t.chipBorder}`,
              background: copied ? BRAND.accent : 'transparent',
              color: copied ? '#fff' : paper.ink,
              fontSize: 13, fontWeight: 700,
              letterSpacing: '-0.005em',
              cursor: 'pointer',
              fontFamily: '"Noto Sans Armenian", "Manrope", sans-serif',
              transition: 'background .15s, color .15s, border-color .15s',
              WebkitTapHighlightColor: 'transparent'
            }, color: "rgb(255, 255, 255)", borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.647)" }}>
          {copied ?
          <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5 10 17.5 19.5 7" />
              </svg>
              Պատճենված է
            </> :

          <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: "rgb(212, 116, 51)" }}>
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Պատճենել կոդը
            </>
          }
        </button>
      </div>
    </>);

};

// ============================================================
// Paper palette shared by the merged gift-card ticket
// ============================================================
const gcPaper = (theme) => theme === 'dark' ? {
  body: '#161616',
  stub: '#0E0E0E',
  ink: '#FFFFFF',
  inkMuted: 'rgba(255,255,255,0.62)',
  inkFaint: 'rgba(255,255,255,0.40)',
  divider: 'rgba(255,255,255,0.16)',
  codeBg: 'rgba(255,255,255,0.04)',
  grain: 'rgba(255,255,255,0.02)'
} : {
  body: '#FFFFFF',
  stub: '#F4F4F2',
  ink: '#0F0F0F',
  inkMuted: 'rgba(15,15,15,0.62)',
  inkFaint: 'rgba(15,15,15,0.42)',
  divider: 'rgba(15,15,15,0.16)',
  codeBg: '#FFFFFF',
  grain: 'rgba(0,0,0,0.025)'
};

// ============================================================
// Main GiftCardConfirmation
// ============================================================
const GiftCardConfirmation = ({ theme = 'light', data, width = 600, compact = false, stubLayout = 'split' }) => {
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
      {/* ============ Logo ============ */}
      {!compact &&
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <KPLogo mode={theme === 'dark' ? 'dark' : 'light'} height={26} />
        </div>
      }

      {/* ============ Combined physical gift card (body + perforation + stub) ============ */}
      {(() => {
        const paper = gcPaper(theme);
        const PERF_R = 10;
        const bodyMask = `
          radial-gradient(circle ${PERF_R}px at 0% 100%, transparent ${PERF_R - 0.5}px, #000 ${PERF_R}px),
          radial-gradient(circle ${PERF_R}px at 100% 100%, transparent ${PERF_R - 0.5}px, #000 ${PERF_R}px)
        `;
        const stubMask = `
          radial-gradient(circle ${PERF_R}px at 0% 0%, transparent ${PERF_R - 0.5}px, #000 ${PERF_R}px),
          radial-gradient(circle ${PERF_R}px at 100% 0%, transparent ${PERF_R - 0.5}px, #000 ${PERF_R}px)
        `;
        const maskShared = { maskComposite: 'intersect', WebkitMaskComposite: 'source-in' };

        return (
          <div style={{
            position: 'relative',
            marginBottom: 0,
            filter: theme === 'dark' ?
            ['drop-shadow(0 0 0.6px rgba(255,255,255,0.45))', 'drop-shadow(0 0 18px rgba(255,255,255,0.04))', 'drop-shadow(0 22px 42px rgba(0,0,0,0.55))'].join(' ') :
            ['drop-shadow(0 0 0.5px rgba(15,15,15,0.22))', 'drop-shadow(0 16px 36px rgba(15,15,15,0.16))'].join(' ')
          }}>
            {/* BODY: header + art + message */}
            <div style={{
              position: 'relative',
              background: paper.body,

              padding: '16px 16px 22px',
              boxSizing: 'border-box',
              backgroundImage: `radial-gradient(${paper.grain} 1px, transparent 1px)`,
              backgroundSize: '4px 4px',
              maskImage: bodyMask, WebkitMaskImage: bodyMask, ...maskShared, borderRadius: "16px 16px 0px 0px"
            }}>
              {/* Header — KP logo + expire date */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 14,
                borderBottom: `1px dashed ${paper.divider}`, padding: "2px 6px 8px"
              }}>
                <KPLogo mode={theme === 'dark' ? 'dark' : 'light'} height={20} />
                <div style={{
                  fontFamily: '"JetBrains Mono", "SFMono-Regular", "Roboto Mono", Menlo, monospace',
                  fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
                  fontWeight: 700, color: paper.ink,
                  display: 'flex', alignItems: 'center', gap: 7, lineHeight: 1
                }}>
                  <span style={{ ...{ color: paper.inkFaint, fontSize: "12px", opacity: "0.74", letterSpacing: "1.8px", lineHeight: "1.4", textAlign: "left", fontWeight: "700" }, color: "rgb(255, 255, 255)" }}>ՄԻՆՉ</span>
                  <span style={{ color: BRAND.accent, fontSize: "12px", lineHeight: 1 }}>{data.validUntil}</span>
                </div>
              </div>

              {/* Gift card art */}
              <div style={{ marginBottom: data.message ? 16 : 4 }}>
                <GiftCardArt theme={theme} variant={data.variant} />
              </div>

              {data.message && <div style={{ position: 'relative', padding: "6px 8px 0px" }}>
                <div style={{
                  position: 'absolute', top: 4, left: 14,
                  fontFamily: '"Manrope", Georgia, serif',
                  fontSize: 88, lineHeight: 1, fontWeight: 800,
                  color: BRAND.accent, opacity: 0.16,
                  pointerEvents: 'none', userSelect: 'none'
                }}>“</div>

                <div style={{
                  position: 'relative',
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 11, fontWeight: 500,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: paper.inkFaint, marginBottom: 12
                }}>ՀԱՂՈՐԴԱԳՐՈՒԹՅՈՒՆ</div>

                <p style={{
                  position: 'relative', margin: 0,
                  lineHeight: 1.55, color: paper.ink,
                  fontFamily: '"Noto Sans Armenian", "Manrope", sans-serif',
                  fontStyle: 'italic', letterSpacing: '-0.005em',
                  textWrap: 'pretty', whiteSpace: 'pre-line', fontSize: "14px"
                }}>{data.message}</p>

                {/* Signature — simple for banner (info repeats in stub),
                                                                                                    full gift tag for split layout */}
                {stubLayout === 'banner' ?
                <div style={{
                  position: 'relative', marginTop: 16, paddingTop: 12,
                  borderTop: `1px dashed ${paper.divider}`
                }}>
                  <span style={{
                    fontSize: 11, fontWeight: 500,
                    letterSpacing: '0.04em', textTransform: 'uppercase',
                    color: paper.inkFaint
                  }}>— {data.buyer.firstName} {data.buyer.lastName}</span>
                </div> :

                <div style={{
                  position: 'relative', marginTop: 16, paddingTop: 14,
                  borderTop: `1px dashed ${paper.divider}`,
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  columnGap: 16, rowGap: 9,
                  alignItems: 'baseline'
                }}>
                  <span style={{
                    fontFamily: '"JetBrains Mono", "SFMono-Regular", "Roboto Mono", Menlo, monospace',
                    fontWeight: 500, letterSpacing: '0.2em',
                    textTransform: 'uppercase', color: paper.inkFaint, fontSize: "12px"
                  }}>Ստացող</span>
                  <span style={{
                    fontSize: 14, color: paper.ink,
                    fontFamily: '"Noto Sans Armenian", "Manrope", sans-serif',
                    textAlign: 'right', fontWeight: "700", width: "122px"
                  }}>{data.recipient.name}</span>

                  <span style={{
                    fontFamily: '"JetBrains Mono", "SFMono-Regular", "Roboto Mono", Menlo, monospace',
                    fontWeight: 500, letterSpacing: '0.2em',
                    textTransform: 'uppercase', color: paper.inkFaint, fontSize: "12px"
                  }}>Նվիրող</span>
                  <span style={{
                    fontSize: 14, fontWeight: 700, color: paper.ink,
                    fontFamily: '"Noto Sans Armenian", "Manrope", sans-serif',
                    textAlign: 'right', width: "166px"
                  }}>{data.buyer.firstName} {data.buyer.lastName}</span>

                  {/* divider between sender and price */}
                  <span style={{
                    gridColumn: '1 / -1',
                    height: 1,
                    borderTop: `1px dashed ${paper.divider}`,
                    margin: '3px 0'
                  }} />

                  <span style={{
                    fontFamily: '"JetBrains Mono", "SFMono-Regular", "Roboto Mono", Menlo, monospace',
                    fontWeight: 500, letterSpacing: '0.2em',
                    textTransform: 'uppercase', color: paper.inkFaint, fontSize: "12px"
                  }}>Արժեք</span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'baseline', gap: 5,
                    justifyContent: 'flex-end',
                    fontFamily: '"Manrope", sans-serif',
                    textAlign: 'right'
                  }}>
                    <span style={{
                      fontSize: 24, fontWeight: 800, color: paper.ink,
                      letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', lineHeight: 1
                    }}>{data.balance.toLocaleString('en-US')}</span>
                    <span style={{ fontSize: 17, fontWeight: 700, color: BRAND.accent, lineHeight: 1 }}>֏</span>
                  </span>
                </div>
                }
              </div>}
            </div>

            {/* PERFORATION dashed line */}
            <div style={{ position: 'relative', height: 0, zIndex: 1, pointerEvents: 'none' }}>
              <div style={{
                position: 'absolute', left: PERF_R + 4, right: PERF_R + 4, top: -1,
                height: 2,
                backgroundImage: `linear-gradient(to right, ${paper.divider} 50%, transparent 50%)`,
                backgroundSize: '8px 2px', backgroundRepeat: 'repeat-x'
              }} />
            </div>

            {/* STUB: code + copy + balance */}
            <div style={{
              position: 'relative',
              background: paper.stub,

              padding: '24px 20px 22px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: stubLayout === 'banner' ? 'column' : 'row',
              alignItems: stubLayout === 'banner' ? 'stretch' : 'flex-start',
              gap: stubLayout === 'banner' ? 16 : 18,
              backgroundImage: `radial-gradient(${paper.grain} 1px, transparent 1px)`,
              backgroundSize: '4px 4px',
              maskImage: stubMask, WebkitMaskImage: stubMask, ...maskShared, borderRadius: "0px 0px 16px 16px"
            }}>
              <GiftCardStub data={data} theme={theme} paper={paper} layout={stubLayout} />
            </div>
          </div>);
      })()}

      {/* ============ Primary CTA ============ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 8,
        marginTop: 20
      }}>
        <a
          href={data.sendUrl || '#'}
          style={{ ...{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '18px 16px',
              background: BRAND.accent,
              color: '#fff',
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '-0.005em',
              textDecoration: 'none',
              boxShadow: '0 8px 24px -8px rgba(242,107,31,0.5)',
              fontFamily: '"Noto Sans Armenian", "Manrope", sans-serif',
              minWidth: 0
            }, background: "rgb(226, 123, 54)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2 11 13" />
            <path d="M22 2 15 22l-4-9-9-4Z" />
          </svg>
          Ակտիվացնել քարտը
        </a>
      </div>

      {/* ============ How-to-redeem callout ============ */}
      <div style={{
        marginTop: 22,
        padding: '14px 16px',
        borderRadius: 12,
        background: 'transparent',
        border: `1px dashed ${t.divider}`,
        display: 'flex', alignItems: 'flex-start', gap: 10
      }}>
        <div style={{
          marginTop: 1,
          width: 22, height: 22, borderRadius: 6,
          background: BRAND.accentSoft,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flex: 'none'
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke={BRAND.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        </div>
        <div style={{ flex: 1, fontSize: 12, color: t.inkMuted, lineHeight: 1.5 }}>
          <div style={{ color: t.ink, fontWeight: 700, marginBottom: 2 }}>
            Ինչպես օգտագործել
          </div>
          Մուտքագրիր կոդը վճարման պահին kinopark.am-ում կամ ակտիվացրու հավելվածում կամ կայքում իմ քարտը բաժնում։
        </div>
      </div>

          </div>);

};

window.GiftCardConfirmation = GiftCardConfirmation;
window.GiftCardArt = GiftCardArt;