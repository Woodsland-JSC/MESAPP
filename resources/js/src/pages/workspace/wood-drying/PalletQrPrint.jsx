import { QRCodeCanvas } from "qrcode.react";

const PalletQrPrint = ({ data, flex }) => {
    return (
        <div
            className={`print-qr ${flex ? '' : 'gap-x-10'}`}
            style={{
                width: flex ? "110mm" : '100%',      
                height: flex ? "100mm" : '100%', 
                display: "flex",
                flexDirection: flex ? "column" : '',
                alignItems: flex ? "center" : '',
                justifyContent: flex ? "center" : 'space-between',

                padding: flex ? "6mm" : '20px 20px',
                background: "#fff",
                border: "1px solid #1e40af",
                borderRadius: "4mm",

                boxSizing: "border-box",
                pageBreakInside: "avoid",
                breakInside: "avoid"
            }}
        >
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: flex ? "4mm" : ''
            }}>
                <QRCodeCanvas
                    value={"YS2544-00001"}
                    size={flex ? 180 : 200}
                    level="H"
                    style={{
                        display: "block",
                        padding: 0
                    }}
                />
            </div>

            <div style={{ gap: "2mm" }} className={`${flex ? 'text-center' : 'flex flex-col justify-start' } `}>
                <div style={{ fontSize: "10mm", fontWeight: 700, lineHeight: 1 }}>
                    YS2544-00001
                </div>

                <div style={{ fontSize: "6mm" }}>
                    Mục đích: OUTDOOR
                </div>

                <div style={{ fontSize: "6mm" }}>
                    [23x57x900 - 24x56x850]
                </div>

                <div style={{ fontSize: "6mm" }}>
                    Mã lô gỗ: 25123s11
                </div>
            </div>
        </div>
    );
}

export default PalletQrPrint;
