// TicketEmail — KinoPark transactional ticket email
// Works in both 'dark' and 'light' themes via the `theme` prop.

const { useEffect, useRef, useState, useMemo } = React;

// ============================================================
// Brand tokens
// ============================================================
const BRAND = {
  accent: '#F26B1F', // KP signature warm orange
  accentHover: '#D85A12',
  accentSoft: '#FFE4D2'
};

const THEMES = {
  light: {
    pageBg: '#E5E5E2', // neutral mid-light gray — darker so white ticket has clear contrast
    card: '#FFFFFF',
    cardEdge: 'rgba(15, 15, 15, 0.06)',
    ink: '#0F0F0F',
    inkMuted: 'rgba(15, 15, 15, 0.56)',
    inkFaint: 'rgba(15, 15, 15, 0.38)',
    divider: 'rgba(15, 15, 15, 0.08)',
    chipBg: '#FFFFFF',
    chipBorder: 'rgba(15, 15, 15, 0.12)',
    fieldBg: '#F7F7F6',
    qrBg: '#FFFFFF',
    qrInk: '#0F0F0F',
    scallop: '#E5E5E2', // must match pageBg for cut-out illusion
    footerBg: '#0F0F0F',
    footerInk: 'rgba(255,255,255,0.72)',
    footerInkFaint: 'rgba(255,255,255,0.45)',
    logoInk: '#0F0F0F'
  },
  dark: {
    pageBg: '#0A0A0A',
    card: '#141414',
    cardEdge: 'rgba(255, 255, 255, 0.06)',
    ink: '#FFFFFF',
    inkMuted: 'rgba(255, 255, 255, 0.62)',
    inkFaint: 'rgba(255, 255, 255, 0.40)',
    divider: 'rgba(255, 255, 255, 0.08)',
    chipBg: 'rgba(255,255,255,0.04)',
    chipBorder: 'rgba(255, 255, 255, 0.12)',
    fieldBg: 'rgba(255,255,255,0.03)',
    qrBg: '#FFFFFF', // QR always white for scanability
    qrInk: '#0F0F0F',
    scallop: '#0A0A0A',
    footerBg: '#000000',
    footerInk: 'rgba(255,255,255,0.62)',
    footerInkFaint: 'rgba(255,255,255,0.35)',
    logoInk: '#FFFFFF'
  }
};

// ============================================================
// QR — rendered locally with qrcode.js → data URL
// ============================================================
// QR rendered via api.qrserver.com — mirrors how the real transactional
// email will embed the QR as a server-generated image.
const QRCanvas = ({ value, size = 240, fg = '#0F0F0F', bg = '#FFFFFF' }) => {
  const fgHex = fg.replace('#', '');
  const bgHex = bg.replace('#', '');
  const px = size * 2; // 2x for retina
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${px}x${px}&margin=4&data=${encodeURIComponent(value)}&color=${fgHex}&bgcolor=${bgHex}&ecc=M`;

  return (
    <div style={{
      width: size, height: size, background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 8
    }}>
      <img src={url} alt="QR" width={size} height={size}
      style={{ display: 'block', imageRendering: 'pixelated' }} />
    </div>);

};

// ============================================================
// Icons (single-stroke, brand-neutral)
// ============================================================
const Icon = {
  Calendar: ({ size = 18, color = 'currentColor' }) =>
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>,

  Clock: ({ size = 16, color = 'currentColor' }) =>
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>,

  Hall: ({ size = 16, color = 'currentColor' }) =>
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h18l-1.5 9.5a2 2 0 0 1-2 1.5h-11a2 2 0 0 1-2-1.5L3 8Z" />
      <path d="M7 8V6a5 5 0 0 1 10 0v2" />
    </svg>,

  Seat: ({ size = 16, color = 'currentColor' }) =>
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 11V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5" />
      <path d="M3 11h18v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Z" />
      <path d="M7 18v2M17 18v2" />
    </svg>,

  Date: ({ size = 16, color = 'currentColor' }) =>
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="6" width="16" height="14" rx="2" />
      <path d="M4 10h16M9 4v4M15 4v4" />
    </svg>,

  Pin: ({ size = 14, color = 'currentColor' }) =>
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-7-6.5-7-12a7 7 0 1 1 14 0c0 5.5-7 12-7 12Z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>,

  Check: ({ size = 14, color = 'currentColor' }) =>
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5 10 17.5 19.5 7" />
    </svg>

};

// ============================================================
// KinoPark wordmark — real logo (3 lollipops + KINOPARK).
// Text color swaps for theme; circle colors stay fixed.
// ============================================================
const KPLogo = ({ height = 22, mode = 'dark', iconOnly = false }) => {
  const ink = mode === 'dark' ? '#FCFCFD' : '#0F0F0F';
  if (iconOnly) {
    // Just the three lollipops (cropped to icon area).
    return (
      <svg
        width={44 / 29 * height} height={height}
        viewBox="0 0 44 29" fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}>
        <circle cx="36.0608" cy="19.054" r="5.95047" fill="#E6652C" stroke={ink} strokeWidth="0.607375" />
        <circle cx="26.7311" cy="16.6045" r="8.40002" fill="#FDB73A" stroke={ink} strokeWidth="0.607375" />
        <circle cx="12.6072" cy="12.9041" r="12.1004" fill="#73A050" stroke={ink} strokeWidth="0.607375" />
        <path d="M12.6074 17.9074V28.0183M26.4187 20.6037V28.0183M36.1648 23.8688V28.0183" stroke={ink} strokeWidth="0.607375" />
      </svg>);
  }
  return (
    <svg
      width={145 / 29 * height}
      height={height}
      viewBox="0 0 145 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}>

      <path d="M96.5332 13.9756H101.036C103.751 13.9756 105.636 15.3928 105.636 17.7778V17.8102C105.636 20.428 103.409 21.7703 100.813 21.7703H97.4584V26.4025H96.5332V13.9756ZM100.846 20.9078C103.146 20.9078 104.711 19.6931 104.711 17.8709V17.8406C104.711 15.8585 103.208 14.8361 100.973 14.8361H97.4584V20.9098L100.846 20.9078Z" fill={ink} />
      <path d="M111.354 13.8805H112.249L118.031 26.4025H117.001L115.436 22.9203H108.129L106.532 26.4025H105.574L111.354 13.8805ZM115.061 22.0902L111.802 14.9029L108.512 22.0902H115.061Z" fill={ink} />
      <path d="M120.172 13.9756H125.379C126.912 13.9756 128.124 14.4555 128.859 15.1904C129.165 15.4968 129.407 15.8606 129.572 16.2608C129.737 16.6611 129.821 17.0899 129.819 17.5227V17.5632C129.819 19.6384 128.284 20.8208 126.175 21.1083L130.264 26.4106H129.114L125.152 21.2682H121.103V26.4106H120.176L120.172 13.9756ZM125.282 20.428C127.359 20.428 128.892 19.3752 128.892 17.5936V17.5632C128.892 15.901 127.582 14.8462 125.314 14.8462H121.099V20.4361L125.282 20.428Z" fill={ink} />
      <path d="M132.5 13.9777H133.425V22.1226L141.315 13.9777H142.595L137.163 19.4704L142.817 26.4026H141.603L136.525 20.1102L133.425 23.2402V26.4026H132.5V13.9777Z" fill={ink} />
      <path d="M144.785 27.7327H44.8008V28.5H144.785V27.7327Z" fill={ink} />
      <path d="M46.6855 13.9291H47.6108V22.1064L55.5006 13.9291H56.7781L51.3482 19.4238L57.0028 26.3539H55.7881L50.678 20.0615L47.6108 23.1916V26.3539H46.6855V13.9291Z" fill={ink} />
      <path d="M61.3472 13.9291H60.4199V26.3539H61.3472V13.9291Z" fill={ink} />
      <path d="M66.0723 13.9291H66.9671L75.5271 24.7262V13.9291H76.3895V26.3539H75.7194L66.9671 15.3341V26.3539H66.0723V13.9291Z" fill={ink} />
      <path d="M80.4785 20.1951V20.1628C80.4785 16.7777 82.9688 13.7428 86.7385 13.7428C90.4759 13.7428 92.9358 16.7129 92.9358 20.1V20.1628C92.9358 23.5499 90.4435 26.5523 86.7061 26.5523C82.9688 26.5523 80.4785 23.5762 80.4785 20.1951ZM92.0085 20.1951V20.1628C92.0085 17.0975 89.7815 14.5729 86.7061 14.5729C83.6308 14.5729 81.4422 17.0328 81.4422 20.1V20.1628C81.4422 23.23 83.6693 25.7223 86.7446 25.7223C89.82 25.7223 92.0085 23.2624 92.0085 20.1951Z" fill={ink} />
      <path d="M144.785 11.694H44.8008V12.4613H144.785V11.694Z" fill={ink} />
      <circle cx="36.0608" cy="19.054" r="5.95047" fill="#E6652C" stroke={ink} strokeWidth="0.607375" />
      <circle cx="26.7311" cy="16.6045" r="8.40002" fill="#FDB73A" stroke={ink} strokeWidth="0.607375" />
      <circle cx="12.6072" cy="12.9041" r="12.1004" fill="#73A050" stroke={ink} strokeWidth="0.607375" />
      <path d="M12.6074 17.9074V28.0183M26.4187 20.6037V28.0183M36.1648 23.8688V28.0183" stroke={ink} strokeWidth="0.607375" />
    </svg>);

};


// ============================================================
// Poster placeholder (designed; user can swap to real image)
// ============================================================
const PosterPlaceholder = ({ src, title, theme }) => {
  if (src) {
    return (
      <div style={{
        aspectRatio: '16 / 10',
        width: '100%',
        background: '#000',
        borderRadius: 14,
        overflow: 'hidden'
      }}>
        <img src={src} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>);

  }
  // Stylized fallback poster — bold typographic
  return (
    <div style={{
      aspectRatio: '16 / 10',
      width: '100%',
      borderRadius: 14,
      overflow: 'hidden',
      position: 'relative',
      background: 'linear-gradient(135deg, #1B2A4E 0%, #6E2B2B 55%, #F26B1F 100%)',
      display: 'flex',
      alignItems: 'flex-end',
      padding: 24,
      color: '#fff',
      fontFamily: '"Manrope", "Noto Sans Armenian", sans-serif'
    }}>
      {/* subtle film grain via repeating diagonal lines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 6px)',
        pointerEvents: 'none'
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.18em', opacity: 0.7, textTransform: 'uppercase', marginBottom: 6 }}>
          poster · 16:10
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.01em' }}>
          {title}
        </div>
      </div>
    </div>);

};

// ============================================================
// Small atoms
// ============================================================
const Chip = ({ children, theme }) => {
  const t = THEMES[theme];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 12px',
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: '0.02em',
      color: t.ink,
      background: t.chipBg,
      border: `1px solid ${t.chipBorder}`,
      borderRadius: 999
    }}>
      {children}
    </span>);

};

const InfoCell = ({ icon, label, value, theme, accent = false }) => {
  const t = THEMES[theme];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '14px 16px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 11, fontWeight: 500,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: t.inkFaint
      }}>
        {icon}
        {label}
      </div>
      <div style={{
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: '-0.01em',
        color: accent ? BRAND.accent : t.ink,
        lineHeight: 1.1,
        fontFamily: '"Manrope", "Noto Sans Armenian", sans-serif'
      }}>
        {value}
      </div>
    </div>);

};

const SeatChip = ({ row, seat, theme }) => {
  const t = THEMES[theme];
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      background: t.chipBg,
      border: `1px solid ${t.chipBorder}`,
      borderRadius: 12,
      overflow: 'hidden',
      minWidth: 120
    }}>
      <div style={{
        padding: '10px 12px',
        background: BRAND.accent,
        color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon.Seat size={18} color="#fff" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', padding: '8px 14px', flex: 1 }}>
        <div style={{
          fontSize: 10, fontWeight: 500, letterSpacing: '0.04em',
          textTransform: 'uppercase', color: t.inkFaint, lineHeight: 1
        }}>
          Շարք · Տեղ
        </div>
        <div style={{
          fontFamily: '"Manrope", monospace',
          fontSize: 17, fontWeight: 700, color: t.ink, lineHeight: 1.2, marginTop: 4,
          letterSpacing: '0.02em'
        }}>
          {row} <span style={{ color: t.inkFaint, fontWeight: 500 }}>·</span> {seat}
        </div>
      </div>
    </div>);

};

// Scalloped divider — gives the email the "ticket stub" feel
const ScallopDivider = ({ theme }) => {
  const t = THEMES[theme];
  return (
    <div style={{ position: 'relative', height: 24 }}>
      {/* left half-circle */}
      <div style={{
        position: 'absolute', left: -12, top: 0,
        width: 24, height: 24, borderRadius: '50%',
        background: t.pageBg
      }} />
      {/* right half-circle */}
      <div style={{
        position: 'absolute', right: -12, top: 0,
        width: 24, height: 24, borderRadius: '50%',
        background: t.pageBg
      }} />
      {/* dashed line */}
      <div style={{
        position: 'absolute', left: 18, right: 18, top: 11,
        height: 2,
        backgroundImage: `linear-gradient(to right, ${t.divider} 50%, transparent 0%)`,
        backgroundSize: '10px 2px',
        backgroundRepeat: 'repeat-x'
      }} />
    </div>);

};

// ============================================================
// Main TicketEmail
// ============================================================
const TicketEmail = ({ theme = 'light', data, width = 600 }) => {
  const t = THEMES[theme];

  return (
    <div style={{
      width,
      background: t.pageBg,
      padding: '36px 24px 0',
      fontFamily: '"Noto Sans Armenian", "Manrope", system-ui, sans-serif',
      color: t.ink,
      lineHeight: 1.4
      // boxSizing for children
    }}>
      {/* ====== Logo + transactional intro ====== */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <KPLogo mode={theme === 'dark' ? 'dark' : 'light'} height={26} />
      </div>

      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h1 style={{
          margin: 0,
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          color: t.ink,
          fontFamily: '"Noto Sans Armenian", "Manrope", sans-serif'
        }}>
          Ողջույն{data.firstName ? `, ${data.firstName}` : ''}
        </h1>
        <p style={{
          margin: '12px auto 0',
          fontSize: 15,
          maxWidth: 380,
          color: t.inkMuted,
          lineHeight: 1.5
        }}>
          Շնորհակալ ենք ԿինոՊարկից տոմս գնելու համար։ Ձեր էլեկտրոնային տոմսը պատրաստ է։
        </p>
      </div>

      {/* ====== Ticket card ====== */}
      <div style={{
        background: t.card,
        borderRadius: 20,
        border: `1px solid ${t.cardEdge}`,
        boxShadow: theme === 'light' ?
        '0 1px 0 rgba(15,15,15,0.04), 0 24px 48px -24px rgba(15,15,15,0.18)' :
        '0 1px 0 rgba(255,255,255,0.03), 0 24px 48px -24px rgba(0,0,0,0.6)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* ----- Top section ----- */}
        <div style={{ padding: 20 }}>
          <PosterPlaceholder src={data.posterUrl} title={data.movieTitle} theme={theme} />

          <div style={{ padding: "20px 4px 4px" }}>
            <h2 style={{
              margin: 0,
              fontSize: 30,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: t.ink,
              fontFamily: '"Noto Sans Armenian", "Manrope", sans-serif'
            }}>
              {data.movieTitle}
            </h2>

            <div style={{
              marginTop: 10,
              fontSize: 13,
              color: t.inkMuted,
              lineHeight: 1.4
            }}>
              <span style={{ color: t.inkFaint }}>Ժանր·</span> {data.genre}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
              {data.meta.map((m, i) => <Chip key={i} theme={theme}>{m}</Chip>)}
            </div>
          </div>
        </div>

        {/* ----- Session info grid ----- */}
        <div style={{
          margin: '4px 20px 20px',
          borderRadius: 14,
          background: t.fieldBg,
          border: `1px solid ${t.divider}`,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)'
        }}>
          <div style={{ borderRight: `1px solid ${t.divider}` }}>
            <InfoCell theme={theme}
            icon={<Icon.Date size={12} color={t.inkFaint} />}
            label="Օր" value={data.date} />
          </div>
          <div style={{ borderRight: `1px solid ${t.divider}` }}>
            <InfoCell theme={theme}
            icon={<Icon.Clock size={12} color={t.inkFaint} />}
            label="Տևողություն" value={data.duration} />
          </div>
          <div style={{ borderRight: `1px solid ${t.divider}` }}>
            <InfoCell theme={theme}
            icon={<Icon.Hall size={12} color={t.inkFaint} />}
            label="Սրահ" value={data.hall} />
          </div>
          <div>
            <InfoCell theme={theme}
            icon={<Icon.Clock size={12} color={t.inkFaint} />}
            label="Ժամ" value={data.time} accent />
          </div>
        </div>

        {/* ----- Seats ----- */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: t.inkFaint,
            marginBottom: 10
          }}>
            Ձեր տեղերը · {data.seats.length} {data.seats.length === 1 ? 'տոմս' : 'տոմս'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.seats.map((s, i) =>
            <SeatChip key={i} row={s.row} seat={s.seat} theme={theme} />
            )}
          </div>
        </div>

        {/* ----- Scalloped divider ----- */}
        <ScallopDivider theme={theme} />

        {/* ----- QR section ----- */}
        <div style={{ padding: '8px 20px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            padding: 16,
            background: t.qrBg,
            borderRadius: 16,
            border: `1px solid ${t.cardEdge}`,
            boxShadow: theme === 'dark' ?
            '0 8px 32px -8px rgba(242,107,31,0.25)' :
            'none'
          }}>
            <QRCanvas value={data.qrPayload} size={200} fg={t.qrInk} bg={t.qrBg} />
          </div>

          <div style={{
            marginTop: 18,
            fontSize: 14,
            color: t.inkMuted,
            textAlign: 'center',
            maxWidth: 320,
            lineHeight: 1.5
          }}>
            Ցույց տուր QR կոդը դահլիճ մտնելուց
          </div>

          <div style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: `1px dashed ${t.divider}`,
            width: '100%',
            display: 'flex', justifyContent: 'center', gap: 6,
            fontSize: 13
          }}>
            <span style={{ color: t.inkFaint }}>Գործարքի №</span>
            <span style={{
              color: t.ink, fontWeight: 700,
              fontFamily: '"Manrope", monospace', letterSpacing: '0.04em'
            }}>
              {data.orderNumber}
            </span>
          </div>
        </div>
      </div>

      {/* ====== Primary CTA: Add to Calendar ====== */}
      <a
        href={data.calendarUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          marginTop: 20,
          padding: '18px 24px',
          background: BRAND.accent,
          color: '#fff',
          borderRadius: 14,
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: '-0.005em',
          textDecoration: 'none',
          boxShadow: '0 8px 24px -8px rgba(242,107,31,0.5)',
          fontFamily: '"Noto Sans Armenian", "Manrope", sans-serif'
        }}>
        
        <Icon.Calendar size={20} color="#fff" />
        Ավելացնել օրացույցում
      </a>

      {/* ====== Secondary helpers ====== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        marginTop: 10
      }}>
        <a href="#" style={{
          padding: '14px 16px',
          borderRadius: 12,
          border: `1px solid ${t.chipBorder}`,
          background: 'transparent',
          color: t.ink,
          fontSize: 13,
          fontWeight: 600,
          textDecoration: 'none',
          textAlign: 'center'
        }}>
          Իմ պատվերները
        </a>
        <a href="#" style={{
          padding: '14px 16px',
          borderRadius: 12,
          border: `1px solid ${t.chipBorder}`,
          background: 'transparent',
          color: t.ink,
          fontSize: 13,
          fontWeight: 600,
          textDecoration: 'none',
          textAlign: 'center'
        }}>
          Օգնության կենտրոն
        </a>
      </div>

      {/* ====== Location hint ====== */}
      <div style={{
        marginTop: 22,
        padding: '14px 16px',
        borderRadius: 12,
        background: 'transparent',
        border: `1px dashed ${t.divider}`,
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

      {/* ====== Footer ====== */}
      <div style={{
        margin: '32px -24px 0',
        padding: '28px 28px 32px',
        background: t.footerBg,
        color: t.footerInk
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
          marginTop: 18,
          paddingTop: 16,
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

// Export to window for the host page
window.TicketEmail = TicketEmail;
window.THEMES = THEMES;
window.BRAND = BRAND;