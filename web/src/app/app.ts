import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';

export interface StripeItem {
  id: string;
  number: number;
  name: string;
  detail: string;
  status: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly http = inject(HttpClient);
  protected readonly items = toSignal(this.http.get<StripeItem[]>('/api/charges'), {
    initialValue: [] as StripeItem[],
  });
}
