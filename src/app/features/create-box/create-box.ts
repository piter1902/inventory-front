import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BoxesService } from '../../services/boxes.service';
import { CreateBoxCommand } from '../../models/box.models';

interface PendingItem {
  id: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-create-box',
  imports: [RouterLink],
  templateUrl: './create-box.html',
  styleUrl: './create-box.scss',
})
export class CreateBox {
  private boxesService = inject(BoxesService);
  private router = inject(Router);

  name = signal('');
  items = signal<PendingItem[]>([]);
  imageBase64 = signal<string | null>(null);
  saving = signal(false);
  nameError = signal(false);

  get itemCount(): number {
    return this.items().length;
  }

  updateName(value: string): void {
    this.name.set(value);
    if (value.trim()) this.nameError.set(false);
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

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.imageBase64.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  create(): void {
    const trimmedName = this.name().trim();
    if (!trimmedName) {
      this.nameError.set(true);
      return;
    }

    this.saving.set(true);

    const nonEmpty = this.items().filter(i => i.name.trim());

    const command: CreateBoxCommand = {
      name: trimmedName,
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
