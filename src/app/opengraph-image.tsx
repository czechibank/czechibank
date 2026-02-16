import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CzechiBank — Learn Banking APIs the Fun Way";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: "1200",
        height: "630",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "#FFF8F5",
      }}
    >
      {/* Subtle background gradient orbs */}
      <div
        style={{
          position: "absolute",
          top: "-80px",
          left: "-80px",
          width: "360px",
          height: "360px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,140,90,0.15) 0%, transparent 70%)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-120px",
          right: "-60px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,100,130,0.12) 0%, transparent 70%)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "100px",
          right: "200px",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,180,50,0.08) 0%, transparent 70%)",
          display: "flex",
        }}
      />

      {/* Main content area */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          height: "100%",
          padding: "48px 56px",
          alignItems: "center",
          gap: "48px",
        }}
      >
        {/* Left side - text content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: "1",
            gap: "20px",
            justifyContent: "center",
          }}
        >
          {/* Logo area */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            {/* Logo icon - flame/rocket style */}
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #FF8C42, #FF5E62)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(255,94,98,0.3)",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ display: "flex" }}>
                <path
                  d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                  fill="white"
                  stroke="white"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: "#1A1A1A",
                  letterSpacing: "-0.5px",
                }}
              >
                CZECHIBANK
              </span>
              <span
                style={{
                  fontSize: "14px",
                  color: "#888",
                  fontWeight: 500,
                  marginTop: "-2px",
                }}
              >
                Your API Playground
              </span>
            </div>
          </div>

          {/* Main heading */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              marginTop: "8px",
            }}
          >
            <span
              style={{
                fontSize: "48px",
                fontWeight: 800,
                color: "#1A1A1A",
                lineHeight: 1.15,
                letterSpacing: "-1px",
              }}
            >
              Learn banking APIs
            </span>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span
                style={{
                  fontSize: "48px",
                  fontWeight: 800,
                  color: "#1A1A1A",
                  lineHeight: 1.15,
                  letterSpacing: "-1px",
                  position: "relative",
                  display: "flex",
                }}
              >
                <span style={{ position: "relative", display: "flex" }}>
                  the fun way!
                  <div
                    style={{
                      position: "absolute",
                      bottom: "2px",
                      left: "0",
                      right: "0",
                      height: "14px",
                      background: "linear-gradient(90deg, #FF9ECE, #FFB8D9, #FF85C0)",
                      borderRadius: "4px",
                      opacity: 0.7,
                      display: "flex",
                    }}
                  />
                </span>
              </span>
            </div>
          </div>

          {/* Description */}
          <p
            style={{
              fontSize: "18px",
              color: "#555",
              lineHeight: 1.6,
              maxWidth: "480px",
              marginTop: "4px",
            }}
          >
            A sandbox banking app for developers and students. Create accounts, make transfers, and explore REST
            endpoints — break things, learn, and have fun!
          </p>

          {/* URL / CTA hint */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "8px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#4CAF50",
                display: "flex",
              }}
            />
            <span
              style={{
                fontSize: "15px",
                color: "#888",
                fontWeight: 500,
              }}
            >
              czechibank.com
            </span>
          </div>
        </div>

        {/* Right side - app preview card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "420px",
            flexShrink: 0,
          }}
        >
          {/* Main dashboard card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: "white",
              borderRadius: "20px",
              border: "2.5px solid #1A1A1A",
              overflow: "hidden",
              boxShadow: "6px 6px 0px #1A1A1A, 0 8px 32px rgba(0,0,0,0.08)",
            }}
          >
            {/* Orange top bar */}
            <div
              style={{
                height: "8px",
                background: "linear-gradient(90deg, #FF8C42, #FF6B35)",
                display: "flex",
              }}
            />

            {/* Card content */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "24px",
                gap: "18px",
              }}
            >
              {/* Dashboard header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      padding: "4px 12px",
                      background: "#FFF3E0",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#E65100",
                      display: "flex",
                    }}
                  >
                    Dashboard
                  </div>
                </div>
                <div
                  style={{
                    padding: "4px 12px",
                    background: "#E8F5E9",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#2E7D32",
                    display: "flex",
                  }}
                >
                  + Create Account
                </div>
              </div>

              {/* Portfolio section */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "#F9F9F7",
                  borderRadius: "14px",
                  padding: "16px",
                  border: "1.5px solid #E8E8E4",
                  gap: "4px",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#999",
                    letterSpacing: "1px",
                  }}
                >
                  PORTFOLIO TOTAL
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "28px",
                      fontWeight: 800,
                      color: "#1A1A1A",
                    }}
                  >
                    158 851,00
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#999",
                      fontWeight: 600,
                    }}
                  >
                    CZECHITOKEN
                  </span>
                </div>
              </div>

              {/* Account cards */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                }}
              >
                {/* Account 1 */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    background: "white",
                    borderRadius: "14px",
                    border: "2px solid #1A1A1A",
                    overflow: "hidden",
                    boxShadow: "3px 3px 0px #1A1A1A",
                  }}
                >
                  <div
                    style={{
                      height: "5px",
                      background: "linear-gradient(90deg, #FF8C42, #FF6B35)",
                      display: "flex",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      padding: "12px",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#1A1A1A",
                      }}
                    >
                      Main Account
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#999",
                        fontWeight: 500,
                      }}
                    >
                      BALANCE
                    </span>
                    <span
                      style={{
                        fontSize: "20px",
                        fontWeight: 800,
                        color: "#1A1A1A",
                      }}
                    >
                      99 798,00
                    </span>
                  </div>
                </div>

                {/* Account 2 */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    background: "white",
                    borderRadius: "14px",
                    border: "2px solid #1A1A1A",
                    overflow: "hidden",
                    boxShadow: "3px 3px 0px #1A1A1A",
                  }}
                >
                  <div
                    style={{
                      height: "5px",
                      background: "linear-gradient(90deg, #FF8C42, #FF6B35)",
                      display: "flex",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      padding: "12px",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#1A1A1A",
                      }}
                    >
                      Savings
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#999",
                        fontWeight: 500,
                      }}
                    >
                      BALANCE
                    </span>
                    <span
                      style={{
                        fontSize: "20px",
                        fontWeight: 800,
                        color: "#1A1A1A",
                      }}
                    >
                      59 053,00
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    { ...size },
  );
}
