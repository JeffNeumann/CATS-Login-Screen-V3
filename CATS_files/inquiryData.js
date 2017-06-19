var InquiryData;
(function (InquiryData) {
    var configOptions = new Configuration.CSC_Config();
    ;
    ;
    function GetInquiryMaster(id, dynamicFormID, clientID) {
        var data = { ID: id, DynamicFormID: dynamicFormID, ClientID: clientID };
        return Util.callWebService(Util.BuildURL([configOptions.baseURL, "Inquiry", id, "DynamicForm", dynamicFormID, "Client", clientID]), "GET");
    }
    InquiryData.GetInquiryMaster = GetInquiryMaster;
    function SaveInquiryForm(formsFields, inquiry) {
        var data = {
            FormsFields: formsFields,
            Inquiry: inquiry
        };
        return Util.callWebService(Util.BuildURL([configOptions.baseURL, "Inquiry", "SaveInquiryForm"]), "POST", data);
    }
    InquiryData.SaveInquiryForm = SaveInquiryForm;
    //export function DownloadDocument(document: IDocumentEntity, inquiryID: number): JQueryPromise<Data.Response<any>> {
    //    var data = { InquiryID: inquiryID, document: document };
    //    return Util.callWebService(
    //        Util.BuildURL([configOptions.baseURL, "Inquiry", "DownloadDocument"]),
    //        "POST", data);
    //}
    function DownloadSingleDocument(document) {
        debugger;
        var fileParts = document.FileName.split(".");
        if (fileParts.length > 1) {
            var fileName = fileParts[fileParts.length - 2];
            var extension = fileParts[fileParts.length - 1];
        }
        debugger;
        var inquiryID = document.InquiryID;
        var filePrefix = document.FilePrefix;
        var fileUniqueID = document.UniqueID;
        var data = { InquiryID: inquiryID, uniqueID: fileUniqueID };
        //debugger;
        window.location.href = Util.BuildURL([configOptions.baseURL, "Inquiry", "DownloadDocument", inquiryID, fileName, extension, fileUniqueID]);
        return false;
    }
    InquiryData.DownloadSingleDocument = DownloadSingleDocument;
    function DeleteDocument(document, inquiryID) {
        var data = { InquiryID: inquiryID, document: document };
        return Util.callWebService(Util.BuildURL([configOptions.baseURL, "Inquiry", "DeleteDocument"]), "POST", data);
    }
    InquiryData.DeleteDocument = DeleteDocument;
    function DeleteNote(noteID) {
        var data = { noteID: noteID };
        return Util.callWebService(Util.BuildURL([configOptions.baseURL, "Inquiry", "DeleteNote"]), "POST", data);
    }
    InquiryData.DeleteNote = DeleteNote;
    function UpdateNote(inquiryID, noteID, noteItems, formsFields) {
        debugger;
        var data = { NoteItem: noteItems, InquiryID: inquiryID, NoteID: noteID, NoteTypeID: noteItems.newNoteType };
        return Util.callWebService(Util.BuildURL([configOptions.baseURL, "Inquiry", "UpdateNote"]), "POST", data);
    }
    InquiryData.UpdateNote = UpdateNote;
    //, newAttachments: IInquiryNoteAttachment
    function SaveNewDocuments(newAttachments) {
        var data = { InquiryID: newAttachments.InquiryID, NoteID: newAttachments.NoteID, NewAttachments: newAttachments }; //, newAttachments: newAttachments }; noteID: inoteID
        return Util.callWebService(Util.BuildURL([configOptions.baseURL, "Inquiry", "SaveNewDocuments"]), "POST", data);
    }
    InquiryData.SaveNewDocuments = SaveNewDocuments;
    function SaveNewAttachedDocuments(newAttachments) {
        var data = { InquiryID: newAttachments.InquiryID, NoteID: newAttachments.NoteID, NewAttachments: newAttachments }; //, newAttachments: newAttachments }; noteID: inoteID
        return Util.callWebService(Util.BuildURL([configOptions.baseURL, "Inquiry", "SaveNewAttachedDocuments"]), "POST", data);
    }
    InquiryData.SaveNewAttachedDocuments = SaveNewAttachedDocuments;
    function RemoveSingleAttachment(attachment) {
        var data = attachment;
        return Util.callWebService(Util.BuildURL([configOptions.baseURL, "Inquiry", "RemoveAttachment"]), "POST", data);
    }
    InquiryData.RemoveSingleAttachment = RemoveSingleAttachment;
    function SearchContractsForGrid(ContractCode, PropertyCode, PropertyName, ContactType, ReturnContactInfo, ContactName, ContactAddress, ContactCity, ContactState, ContactZip, ContactPhone) {
        var data = { ContractCode: ContractCode, PropertyCode: PropertyCode, PropertyName: PropertyName, ContactType: ContactType, ReturnContactInfo: ReturnContactInfo, ContactName: ContactName, ContactAddress: ContactAddress, ContactCity: ContactCity, ContactState: ContactState, ContactZip: ContactZip, ContactPhone: ContactPhone };
        return Util.callWebService(Util.BuildURL([configOptions.baseURL, "Inquiry", "SearchContractsForGrid"]), "POST", data);
    }
    InquiryData.SearchContractsForGrid = SearchContractsForGrid;
    function reLoadLegacyData(contractCode, clientId) {
        var data = {
            ClientID: clientId,
            ContractCode: contractCode
        };
        return Util.callWebService(Util.BuildURL([configOptions.baseURL, "Inquiry", "GetLegacyData"]), "GET", data);
    }
    InquiryData.reLoadLegacyData = reLoadLegacyData;
    function sendEmail(data) {
        return Util.callWebService(Util.BuildURL([configOptions.baseURL, "Inquiry", "SendEmail"]), "POST", data);
    }
    InquiryData.sendEmail = sendEmail;
    function GetSendEmailInfo(contractId, dynamicFormID, clientId) {
        return Util.callWebService(Util.BuildURL([configOptions.baseURL, "GetSendEmailInfo", "DynamicForm", dynamicFormID, "Contract", contractId, "Client", clientId]), "GET");
    }
    InquiryData.GetSendEmailInfo = GetSendEmailInfo;
})(InquiryData || (InquiryData = {}));
//# sourceMappingURL=inquiryData.js.map