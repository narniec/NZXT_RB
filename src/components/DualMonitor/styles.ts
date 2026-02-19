import styled from 'styled-components'

export const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border-radius: 100%;

  img,
  video {
    position: absolute;
  }

  /* ── CPU / GPU monitoring section ─────────────────── */

  .monitoring {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 80%;
    /* removed height: inherit — lets the section be content-tall
       so the crypto section can sit below it inside the ring */
  }

  .info-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .info-separator {
    height: 20%;
    width: 1px;
    border-right: 1px solid;
    align-self: center;
  }

  .info-title {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    margin-bottom: 10px;
  }

  .info-title svg {
    font-size: 9vw;
  }

  .info-data {
    display: flex;
    justify-content: center;

    .info-icon {
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        margin-right: 5px;
      }
    }

    .info-icon.temperature svg {
      font-size: 7vw;
    }
    .info-icon.load svg {
      font-size: 7vw;
    }

    .data {
      display: flex;
      align-items: baseline;
      min-width: 50px;

      span {
        font-size: 6vw;
      }
    }
  }

  /* ── Crypto divider ────────────────────────────────── */

  .crypto-divider {
    width: 62%;
    height: 1px;
    background: rgba(255, 255, 255, 0.14);
    margin: 6px 0 5px;
    flex-shrink: 0;
  }

  /* ── Crypto info section ───────────────────────────── */

  .crypto-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 72%;
    gap: 2px;
  }

  .crypto-row {
    display: flex;
    align-items: baseline;
    gap: 5px;
    line-height: 1;
  }

  .crypto-icon {
    font-size: 6.5vw;
    opacity: 0.8;
  }

  .crypto-value {
    font-size: 6.2vw;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
  }

  .crypto-change {
    font-size: 3.2vw;
    letter-spacing: 0.02em;

    &.up   { color: #22d87a; }
    &.down { color: #ff5c5c; }
    &.flat { opacity: 0.45;  }
  }

  /* tiny amber dot when data is stale (from cache) */
  .stale-dot {
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #fbbf24;
    vertical-align: middle;
    margin-left: 2px;
  }
`
