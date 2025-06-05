import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DetailCandidatService } from '../service/detail-candidat.service';
import {PreInscriptionsService} from '../service/pre-inscriptions.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-detail-candidat',
  templateUrl: './detail-candidat.component.html',
  styleUrls: ['./detail-candidat.component.scss']
})
export class DetailCandidatComponent implements OnInit {
  candidate: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private detailCandidatService: DetailCandidatService, 
    private preInscriptionsService: PreInscriptionsService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.preInscriptionsService.getCandidateById(id).subscribe(
      (data) => (this.candidate = data),
      (error) => console.error('Erreur:', error)
    );
  }
  
  goBack(): void {
    this.router.navigate(['/pré-inscriptions']);
  }

  getFilePath(filePath: string): string {
    
    const baseUrl = 'http://localhost:8082/files'; 
    return `${baseUrl}/${filePath}`;
  }
  

  
}