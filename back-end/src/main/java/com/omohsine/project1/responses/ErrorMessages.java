package com.omohsine.project1.responses;

/*
authorotmani 
    */
public enum ErrorMessages {

    MISSING_REQUIRED_FIELD("Missing required field."),
    RECORD_ALREADY_EXISTS("Record already exists."),
    INTERNAL_SERVER_ERROR("Internal Bright coding server error."),
    NO_RECORD_FOUND("Record with provided id is not found."),
    USER_WITH_EMAIL_ALREADY_EXIST("Cette email déja utiliser."),
    CANDIDAT_WITH_CIN_ALREADY_EXIST("Cette Cin déja utiliser."),
    ;


    private String errorMessage;

    private ErrorMessages(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }


}
