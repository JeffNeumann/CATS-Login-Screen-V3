var FormatUtil;
(function (FormatUtil) {
    var PhoneHelp = (function () {
        function PhoneHelp() {
        }
        PhoneHelp.formatNumericStringAsPhoneNumber = function (phone) {
            if (!isNaN(parseFloat(phone)) && isFinite(phone)) {
                if (phone.length == 10) {
                    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
                }
                if (phone.length == 11) {
                    //reformat and return phone number
                    return phone.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, "$1($2) $3-$4");
                }
                if (phone.length == 7) {
                    return phone.replace(/(\d{3})(\d{4})/, "$1-$2");
                }
            }
            return phone;
        };
        return PhoneHelp;
    }());
    FormatUtil.PhoneHelp = PhoneHelp;
    var AddressHelp = (function () {
        function AddressHelp() {
        }
        AddressHelp.formatZipAsZipCode = function (zip) {
            if (zip.length == 7) {
                return zip.substring(0, 4) + "-" + zip.substring(4);
            }
            if (zip.length == 9) {
                return zip.substring(0, 5) + "-" + zip.substring(5);
            }
            return zip;
        };
        AddressHelp.formatCityStateZip = function (city, state, zip) {
            return city + ', ' + state + ' ' + FormatUtil.AddressHelp.formatZipAsZipCode(zip);
        };
        return AddressHelp;
    }());
    FormatUtil.AddressHelp = AddressHelp;
})(FormatUtil || (FormatUtil = {}));
//# sourceMappingURL=formatUtil.js.map