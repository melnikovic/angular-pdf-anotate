import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AnnotationFactory, AnnotationIcon } from 'annotpdf';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('pdf') pdf: any;
  pdfFactory: any;
  text = '';
  // pdfSrc = 'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf';
  pdfSrc: any = '../assets/print.pdf';
  coordinates = [];

  constructor(private httpClient: HttpClient) {}

  ngAfterViewInit(): void {
    this.listenCoords();
  }

  addAnnotation() {
    let parameters = this.getParameters();
    this.pdfFactory.createTextAnnotation(
      this.pdfViewer.currentPageNumber - 1,
      [parameters[0], parameters[1], parameters[0] + 22, parameters[1] + 22],
      parameters[2],
      parameters[3]
    );
    this.coordinates = [];
    this.text = '';
    const newData = this.pdfFactory.write();
    this.pdfSrc = newData;
  }

  download() {
    this.pdfFactory.download();
  }

  onLoaded() {
    this.httpClient
      .get(this.pdfSrc, { responseType: 'arraybuffer' })
      .subscribe((arrayBuffer) => {
        const uint8Array = new Uint8Array(arrayBuffer);
        this.pdfFactory = new AnnotationFactory(uint8Array);
      });
  }

  private getParameters() {
    const x = this.coordinates[0];
    const y = this.coordinates[1];
    const content = this.text;
    const author = 'John Doe';

    return [x, y, content, author];
  }

  private listenCoords() {
    let pdfContainer = document.getElementById('viewerContainer') as any;
    pdfContainer.addEventListener('click', (evt: any) => {
      let ost = this.computePageOffset();
      let x = evt.pageX - ost.left;
      let y = evt.pageY - ost.top;

      let x_y = this.pdfViewer._pages[
        this.pdfViewer.currentPageNumber - 1
      ].viewport.convertToPdfPoint(x, y);
      x = x_y[0];
      y = x_y[1];

      (this.coordinates as any[]).push(x);
      (this.coordinates as any[]).push(y);
    });
  }

  private computePageOffset() {
    let pageId = 'page' + this.pdfViewer.currentPageNumber;
    let pg = document.getElementById(pageId);

    var rect = (pg as any).getBoundingClientRect(),
      bodyElt = document.body;
    return {
      top: rect.top + bodyElt.scrollTop,
      left: rect.left + bodyElt.scrollLeft,
    };
  }

  private get pdfViewer(): any {
    return this.pdf.getCurrentViewer();
  }
}
