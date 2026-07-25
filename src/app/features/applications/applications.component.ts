import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';

import { ApplicationService } from './services/application.service';
import { Application, ApplicationStatus } from '../../shared/models/application.model';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './applications.component.html',
  styleUrl: './applications.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationsComponent implements OnInit {
  private readonly applicationService = inject(ApplicationService);
  private readonly route = inject(ActivatedRoute);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  readonly applications = signal<Application[]>([]);
  readonly applicationStatus = signal<ApplicationStatus | null>(null);
  readonly applicationId = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly loadError = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const id = params.get('id');
        this.applicationId.set(id);
        if (id) {
          this.loadApplicationStatus(id);
        } else {
          this.loadApplications();
        }
      });
  }

  loadApplications(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.applicationService
      .getAllApplications()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (list) => this.applications.set(list),
        error: () => {
          this.loadError.set('تعذر تحميل الطلبات. يرجى المحاولة مرة أخرى.');
        },
      });
  }

  loadApplicationStatus(id: string): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.applicationService
      .getApplicationStatus(id)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (status) => this.applicationStatus.set(status),
        error: () => {
          this.loadError.set('تعذر تحميل حالة الطلب.');
        },
      });
  }

  createNewApplication(): void {
    this.applicationService
      .createDraft()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastr.success('تم إنشاء طلب جديد');
          this.loadApplications();
        },
        error: () => {
          this.toastr.error('فشل إنشاء الطلب');
        },
      });
  }
}
