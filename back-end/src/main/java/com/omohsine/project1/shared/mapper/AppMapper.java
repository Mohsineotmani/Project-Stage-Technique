package com.omohsine.project1.shared.mapper;

import com.omohsine.project1.entities.CandidatEntity;
import com.omohsine.project1.shared.dto.CandidatNoteDto;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

@Service
public class AppMapper {
    public  CandidatNoteDto formCandidat(CandidatEntity candidatEntity) {
        CandidatNoteDto candidatNoteDto = new CandidatNoteDto();
        BeanUtils.copyProperties(candidatEntity,candidatNoteDto );
        return candidatNoteDto ;
    }
}
