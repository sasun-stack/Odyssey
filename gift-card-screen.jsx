// GiftCardScreen — renders the GiftCardConfirmation INSIDE an iPhone.
// The iOS mail-app chrome has been stripped (status bar, nav, action bar)
// so this reads as a native KP gift card screen rather than an email.

const GiftCardScreen = ({ theme = 'light', data, compact = false, stubLayout = 'split' }) => {
  const t = window.THEMES[theme];
  const PHONE_W = 390;
  const PHONE_H = 844;

  return (
    <div
      data-dc-allow-scroll="true"
      style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
      <IOSDevice
        width={PHONE_W}
        height={PHONE_H}
        dark={false}>

        {/* Cover the iOS status bar with the gift card page bg so the
            "9:41 / signal / battery" content disappears visually. The
            dynamic island still renders above this (z-index 50). */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 56,
          background: t.pageBg, zIndex: 20, pointerEvents: 'none'
        }} />

        {/* Gift card content — flush to top (status bar area covered above) */}
        <div style={{ paddingTop: 56, background: t.pageBg, minHeight: '100%' }}>
          <GiftCardConfirmation
            theme={theme}
            data={data}
            width={PHONE_W}
            compact={compact}
            stubLayout={stubLayout}
          />
        </div>
      </IOSDevice>
    </div>
  );
};

window.GiftCardScreen = GiftCardScreen;
