const ExcelJS = require('exceljs');
const path = require("path")
const fs = require("fs")

const tenantHeader = [
    "domainName",
    "companyName",
    "accountType",
    "internalUse",
    "status",
    "domainId",
    "campaign",
    "firstUseClicks",
    "owner",
    "ownerEmailAddress",
    "accountAge"
]
const deviceHeader = [
    "domainId",
    "domainName",
    "deviceId",
    "deviceName",
    "planId",
    "planName",
    "deviceType",
    "deviceSubType",
    "lastSeen"
]

const parseInputRow = (rowData, header) => {
    const res = {}
    rowData.forEach((item, index) => {
        res[header[index]] = item
    })
    return res
}


const init = async () => {
    try {
        const deviceFiles = fs.readdirSync(path.join(__dirname, "input", "devices"))
        const tenantFiles = fs.readdirSync(path.join(__dirname, "input", "tenants"))
        if (deviceFiles.length == 0 || tenantFiles.length == 0) {
            throw new Error("Input file is missing")
        }
        const deviceWorkbook = new ExcelJS.Workbook();
        const deviceWorksheet = await deviceWorkbook.csv.readFile(path.join(__dirname, "input", "devices", deviceFiles[0]));
        const tenantWorkbook = new ExcelJS.Workbook();
        const tenantWorksheet = await tenantWorkbook.csv.readFile(path.join(__dirname, "input", "tenants", tenantFiles[0]));

        const tenantData = []
        const deviceData = []
        tenantWorksheet.eachRow(function (row, rowNumber) {
            if (rowNumber != 1)
                tenantData.push(parseInputRow(row.values.slice(1), tenantHeader))
        })
        deviceWorksheet.eachRow(function (row, rowNumber) {
            if (rowNumber != 1)
                deviceData.push(parseInputRow(row.values.slice(1), deviceHeader))
        })

        const outputData=deviceData.map(device=>{
            const tenant=tenantData.find(el=>el.domainName==device.domainName)
            return {
                ...device,
                ...tenant
            }
        })

        const outputWorkbook = new ExcelJS.Workbook();
        const outputSheet = outputWorkbook.addWorksheet()
        outputSheet.columns = [
            { header: "Domain Name", key:"domainName" },
            { header: "Company Name",  key:"companyName" },
            { header: "Account Type",  key:"accountType" },
            { header: "Internal Use",  key:"internalUse" },
            { header: "Status",  key:"status" },
            { header: "Domain Id",  key:"domainId" },
            { header: "Campaign",  key:"campaign" },
            { header: "FirstUse Clicks",  key:"firstUseClicks" },
            { header: "Owner",  key:"owner" },
            { header: "Owner Email Address",  key:"ownerEmailAddress" },
            { header: "Account Age",  key:"accountAge" },
            { header: "Device Id",  key:"deviceId" },
            { header: "Device Name",  key:"deviceName" },
            { header: "Plan Id",  key:"planId" },
            { header: "Plan Name",  key:"planName" },
            { header: "Device Type",  key:"deviceType" },
            { header: "Device SubType",  key:"deviceSubType" },
            { header: "Last Seen", key: "lastSeen" }
        ];

        outputData.map(row=>{
            outputSheet.addRow(row)
        })
        

        await outputWorkbook.xlsx.writeFile(path.join(__dirname, "output", "master.xlsx"));




    } catch (err) { console.log("Error Occur"); console.log(err) }

}



init();