import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BoxesService } from '../../services/boxes.service';
import { CreateBoxCommand, MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH } from '../../models/box.models';
import { PageHeaderService } from '../../layout/page-header/page-header.service';
import { ImageService } from '../../services/image.service';

interface PendingItem {
  id: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-create-box',
  imports: [],
  templateUrl: './create-box.html',
  styleUrl: './create-box.scss',
})
export class CreateBox {
  private boxesService = inject(BoxesService);
  private imageService = inject(ImageService);
  private router = inject(Router);

  constructor() {
    inject(PageHeaderService).setTitle('Nueva Caja');
  }

  name = signal('');
  description = signal('');
  items = signal<PendingItem[]>([]);
  imageBase64 = signal<string | null>(null);
  saving = signal(false);
  nameError = signal(false);
  validationError = signal<string | null>(null);

  get itemCount(): number {
    return this.items().length;
  }

  updateName(value: string): void {
    this.name.set(value);
    if (value.trim()) this.nameError.set(false);
    this.validationError.set(null);
  }

  updateDescription(value: string): void {
    this.description.set(value);
    this.validationError.set(null);
  }

  addItem(): void {
    this.items.update(list => [
      ...list,
      { id: crypto.randomUUID(), name: '', description: '' },
    ]);
  }

  updateItemName(id: string, value: string): void {
    this.items.update(list =>
      list.map(i => (i.id === id ? { ...i, name: value } : i))
    );
  }

  updateItemDescription(id: string, value: string): void {
    this.items.update(list =>
      list.map(i => (i.id === id ? { ...i, description: value } : i))
    );
  }

  removeItem(id: string): void {
    this.items.update(list => list.filter(i => i.id !== id));
  }

  async onPhotoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const compressed = await this.imageService.compressImage(file);
    this.imageBase64.set(compressed);
  }

  create(): void {
    const trimmedName = this.name().trim();
    this.validationError.set(null);

    if (!trimmedName) {
      this.nameError.set(true);
      return;
    }
    if (trimmedName.length > MAX_NAME_LENGTH) {
      this.validationError.set(`El nombre no puede superar los ${MAX_NAME_LENGTH} caracteres.`);
      return;
    }

    const trimmedDescription = this.description().trim();
    if (trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
      this.validationError.set(`La descripción no puede superar los ${MAX_DESCRIPTION_LENGTH} caracteres.`);
      return;
    }

    const nonEmpty = this.items().filter(i => i.name.trim());

    const invalidItem = nonEmpty.find(
      i => i.name.trim().length > MAX_NAME_LENGTH || i.description.trim().length > MAX_DESCRIPTION_LENGTH
    );
    if (invalidItem) {
      this.validationError.set(
        `Cada item debe tener como máximo ${MAX_NAME_LENGTH} caracteres en el nombre y ${MAX_DESCRIPTION_LENGTH} en la descripción.`
      );
      return;
    }

    this.saving.set(true);

    const command: CreateBoxCommand = {
      name: trimmedName,
      description: this.description().trim() || undefined,
      imageBase64: this.imageBase64() ?? undefined,
      items: nonEmpty.length > 0
        ? nonEmpty.map(i => ({ name: i.name.trim(), description: i.description.trim() }))
        : undefined,
    };

    this.boxesService.create(command).subscribe({
      next: box => {
        this.saving.set(false);
        this.router.navigate(['/boxes', box.id]);
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }
}
