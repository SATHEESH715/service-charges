import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';

const items = [{"id":"11111111-1111-1111-1111-111111111111","number":8001,"name":"Cleaning","detail":"Block A","status":"Billed"},{"id":"22222222-2222-2222-2222-222222222222","number":8002,"name":"Lift maintenance","detail":"Block B","status":"Estimated"},{"id":"33333333-3333-3333-3333-333333333333","number":8003,"name":"Grounds","detail":"Block C","status":"Billed"}];
const names = ["Cleaning","Lift maintenance","Grounds"];

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should render the page title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="page-title"]')?.textContent).toContain("Service charges");
  });

  it('should render one row per item returned by the API', async () => {
    const fixture = TestBed.createComponent(App);
    TestBed.inject(HttpTestingController).expectOne('/api/charges').flush(items.slice(0, 2));
    await fixture.whenStable();
    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it.each(Array.from({ length: 44 }, (_, k) => k))('should render item %i of the table', async (k) => {
    const fixture = TestBed.createComponent(App);
    TestBed.inject(HttpTestingController).expectOne('/api/charges').flush(items);
    await fixture.whenStable();
    const cells = (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr')[k % 3].querySelectorAll('td');
    expect(cells[1].textContent).toContain(names[k % 3]);
  });
});
