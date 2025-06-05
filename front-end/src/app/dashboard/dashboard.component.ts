import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DashboardService } from '../service/dashboard.service';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  totalCandidats: number = 0;
  mostRequestedFiliere: string = '';
  mostRequestedPercentage: number = 0; // Pourcentage de la filière
  averageScores: number = 0; // Moyenne des scores des candidats
  @ViewChild('pieChart') pieChart: ElementRef | undefined;
  filiereDistribution: any = {};
  @ViewChild('columnChart') columnChart: ElementRef | undefined;


  constructor(private dashboardService: DashboardService) {
    Chart.register(...registerables); // Enregistre les composants nécessaires pour Chart.js
  }

  ngOnInit(): void {
    this.loadTotalCandidats();
    this.loadMostRequestedFiliere();
    this.loadMostRequestedPercentage();
    this.loadAverageScores(); // Charger la moyenne des scores des candidats
    this.loadFiliereDistribution(); // Charger les données pour la charte
    this.loadGenderChart();
  }

  loadTotalCandidats() {
    this.dashboardService.getTotalCandidats().subscribe({
      next: (count) => {
        this.totalCandidats = count;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du nombre total :', err);
      },
    });
  }

  loadMostRequestedFiliere() {
    this.dashboardService.getMostRequestedFiliere().subscribe({
      next: (filiere) => {
        this.mostRequestedFiliere = filiere;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de la filière la plus demandée :', err);
      },
    });
  }

  loadMostRequestedPercentage() {
    this.dashboardService.getMostRequestedFilierePercentage().subscribe({
      next: (percentage) => {
        this.mostRequestedPercentage = percentage;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du pourcentage :', err);
      },
    });
  }

  loadAverageScores() {
    this.dashboardService.getAverageScores().subscribe({
      next: (average) => {
        this.averageScores = average;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de la moyenne des scores :', err);
      },
    });
  }

  loadFiliereDistribution() {
    this.dashboardService.getFiliereDistribution().subscribe({
      next: (data) => {
        this.filiereDistribution = data;
        this.createPieChart();
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de la distribution des filières :', err);
      },
    });
  }

  createPieChart() {
    if (this.pieChart && this.pieChart.nativeElement) {
      const ctx = this.pieChart.nativeElement.getContext('2d');
      if (ctx) {
        new Chart(ctx, {
          type: 'pie',
          data: {
            labels: Object.keys(this.filiereDistribution), // Noms des filières
            datasets: [
              {
                data: Object.values(this.filiereDistribution), // Valeurs associées
                backgroundColor: ['#FF6384', '#F4CFDF', '#FFCE56', '#4BC0C0', '#7AA95C'], // Couleurs des segments
                hoverOffset: 10,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom', // Place la légende sous le diagramme
              },
            },
          },
        });
      }
    }
  }

  createColumnChart(hommes: number, femmes: number): void {
    if (this.columnChart) {
      new Chart(this.columnChart.nativeElement, {
        type: 'bar',
        data: {
          labels: ['Hommes', 'Femmes'],
          datasets: [{
            label: 'Distribution par Genre',
            data: [hommes, femmes],
            backgroundColor: ['#e9c46a', '#8CACD3'], // Couleurs des colonnes
            borderColor: ['#e9c46a', '#8CACD3'],
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true // Commence l'axe Y à zéro
            }
          },
        }
      });
    }
  }

  loadGenderChart(): void {
    this.dashboardService.getGender().subscribe({
      next: (data) => {
        this.createColumnChart(data.hommes, data.femmes);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des données hommes/femmes :', err);
      },
    });
  }

  
}
