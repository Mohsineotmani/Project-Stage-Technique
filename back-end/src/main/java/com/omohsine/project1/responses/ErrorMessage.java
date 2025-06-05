package com.omohsine.project1.responses;

import java.util.Date;

/*
authorotmani 
    */
public class ErrorMessage {
        private Date timestamp;
        private String message;


    public ErrorMessage(Date timestamp, String message) {
        this.timestamp = timestamp;
        this.message = message;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Date timestamp) {
        this.timestamp = timestamp;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
