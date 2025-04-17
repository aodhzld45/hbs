package com.hbs.hsbbo.common.domain.entity;

import java.io.Serializable;
import java.util.Objects;

public class CodeDetailId implements Serializable {
    private String pcode;
    private Integer dcodeNo;

    public CodeDetailId() {}

    public CodeDetailId(String pcode, Integer dcodeNo) {
        this.pcode = pcode;
        this.dcodeNo = dcodeNo;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CodeDetailId)) return false;
        CodeDetailId that = (CodeDetailId) o;
        return Objects.equals(pcode, that.pcode) &&
                Objects.equals(dcodeNo, that.dcodeNo);
    }

    @Override
    public int hashCode() {
        return Objects.hash(pcode, dcodeNo);
    }
}
