/**
 * Created by TooNies1810 on 6/19/16.
 */
function checkParamValidate(paramSQL) {

    if (paramSQL.indexOf(" ") > -1) {
        console.log("dinh loi space");
        return false;
    }

    if (paramSQL.indexOf(";") > -1) {
        console.log("dinh loi ;");
        return false;
    }

    if (paramSQL.indexOf("%") > -1) {
        console.log("dinh loi %");
        return false;
    }

    if (paramSQL.indexOf("=") > -1) {
        console.log("dinh loi =");
        return false;
    }

    if (paramSQL.indexOf(",") > -1) {
        console.log("dinh loi ,");
        return false;
    }

    if (paramSQL.indexOf("$") > -1) {
        console.log("dinh loi $");
        return false;
    }

    if (paramSQL.indexOf("(") > -1) {
        console.log("dinh loi (");
        return false;
    }

    if (paramSQL.indexOf(")") > -1) {
        console.log("dinh loi )");
        return false;
    }

    if (paramSQL.indexOf("^") > -1) {
        console.log("dinh loi ^");
        return false;
    }

    if (paramSQL.indexOf("&") > -1) {
        console.log("dinh loi &");
        return false;
    }

    return true;
}

function validateParam(paramSQL) {
    return paramSQL.trim().toLowerCase();
}

exports.checkParamValidate = checkParamValidate;
exports.validateParam = validateParam;