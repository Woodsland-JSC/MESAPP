import { QRCodeCanvas } from "qrcode.react";
import logo from "../../../assets/images/WLorigin.svg";

const PalletQrPrint = ({ data, flex }) => {
    return (
        <div
            className={`print-qr`}
            style={{
                width: flex ? "148mm" : 'auto',
                height: flex ? "100mm" : 'auto',
                display: "flex",
                flexDirection: flex ? "column" : '',
                alignItems: flex ? "center" : '',
                justifyContent: flex ? "center" : 'space-between',
                background: "#fff",
                border: "2px solid #1e40af",
                borderRadius: "4mm",
                boxSizing: "border-box",
                pageBreakInside: "avoid",
                breakInside: "avoid"
            }}
        >
            <div style={{
                display: flex ? "block" : 'flex',
                flexDirection: flex ? "row" : 'column',
                justifyContent: flex ? "space-between" : 'center',
                alignItems: flex ? "center" : 'center',
                gap: flex ? '' : '4mm',
                marginBottom: flex ? '4mm' : '0mm',
                borderRight: flex ? 'none' : '2px solid black',
                padding: flex ? '0mm' : '4mm',
                borderRadius: "4mm 0mm 0mm 4mm",
            }}>
                {
                    !flex && (
                        <div>
                            <img src={logo} alt="" width={160} />
                        </div>
                    )
                }

                <QRCodeCanvas
                    value={data?.code ?? "NULL"}
                    size={flex ? 180 : 160}
                    level="H"
                    style={{
                        display: "block",
                        padding: 0
                    }}
                />
            </div>

            <div style={{
                // gap: "2mm" ,
            }}
                className={`${flex ? 'text-center' : 'flex flex-col justify-start'} `}>
                <div style={{
                    fontSize: flex ? "10mm" : "12mm",
                    fontWeight: 700,
                    lineHeight: 1,
                    borderBottom: flex ? 'none' : '2px solid black',
                    padding: flex ? '0mm' : '6mm 8mm 6mm 8mm',
                    width: flex ? 'auto' : '450px',
                    textAlign: 'center'
                }}>
                    {data?.code ?? "YS2544-00001"}
                </div>
                <div style={{
                    display: flex ? 'block' : 'flex',
                    flexDirection: flex ? 'row' : 'column'
                }}>
                    <div style={{
                        fontSize: "6mm",
                        borderBottom: flex ? 'none' : '1px solid black',
                    }}>
                        <table style={{ width: '100%' }}>
                            {
                                flex ? <tr style={{ textAlign: 'center' }}>
                                    <td>{data?.lydo ?? ' INDOOR'}</td>
                                </tr> : (
                                    <tr style={{ textAlign: 'center', }}>
                                        <td style={{ borderRight: '1px solid black', width: '50%' }}>Mục đích</td>
                                        <td style={{ width: '50%' }}>{data?.lydo ?? ' INDOOR'}</td>
                                    </tr>
                                )
                            }
                        </table>
                    </div>

                    {
                        !flex && (
                            <div style={{ fontSize: "6mm", borderBottom: flex ? 'none' : '1px solid black' }}>
                                <table style={{ width: '100%' }}>
                                    {
                                        flex ? <tr style={{ textAlign: 'center' }}>
                                            <td>{data?.malo ?? '202306s1'}</td>
                                        </tr> : (
                                            <tr style={{ textAlign: 'center', }}>
                                                <td style={{ borderRight: '1px solid black', width: '50%' }}>Mã lô gỗ</td>
                                                <td style={{ width: '50%' }}>{data?.malo ?? '202306s1'}</td>
                                            </tr>
                                        )
                                    }
                                </table>
                            </div>
                        )
                    }


                    <div style={{ fontSize: "6mm", borderBottom: flex ? 'none' : '' }}>
                        <table style={{ width: '100%' }}>
                            {
                                flex ? <tr style={{ textAlign: 'center' }}>
                                    <td>[{data?.quyCach ?? '35x46x660'}]</td>
                                </tr> : (
                                    <tr style={{ textAlign: 'center', }}>
                                        {/* <td style={{borderRight: '1px solid black'}}>Mã lô gỗ</td> */}
                                        <td>[{data?.quyCach ?? '35x46x660'}]</td>
                                    </tr>
                                )
                            }
                        </table>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default PalletQrPrint;
