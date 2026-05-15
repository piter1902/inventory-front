import { Component, inject, input, OnInit, signal, viewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { BoxesService } from '../../services/boxes.service';
import { UpdateItemRequest } from '../../models/box.models';
import { PageHeaderService } from '../../layout/page-header/page-header.service';

interface EditableItem {
  id: string;
  name: string;
  description: string;
  _isNew: boolean;
  _isDeleted: boolean;
}

@Component({
  selector: 'app-content-management',
  imports: [],
  templateUrl: './content-management.html',
  styleUrl: './content-management.scss',
})
export class ContentManagement implements OnInit {
  private boxesService = inject(BoxesService);
  private router = inject(Router);
  private readonly headerService = inject(PageHeaderService);

  boxId = input.required<string>();
  boxName = signal('');
  description = signal('');
  identifier = signal('');
  imagePreview = signal<string | null>(null);
  imageBase64 = signal<string | null>(null);
  editItems = signal<EditableItem[]>([]);
  editingItemId = signal<string | null>(null);
  loading = signal(true);
  saving = signal(false);

  fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  get itemsCount(): number {
    return this.editItems().filter(i => !i._isDeleted).length;
  }

  ngOnInit(): void {
    this.headerService.setTitle('Editar Caja');
    this.boxesService.getById(this.boxId()).subscribe({
      next: data => {
        this.boxName.set(data.name ?? '');
        this.description.set(data.description ?? '');
        this.identifier.set(data.identifier ?? '');
        this.imagePreview.set(data.imageBase64 ?? null);
        this.imageBase64.set(data.imageBase64 ?? null);
        this.editItems.set(
          (data.items ?? []).map(i => ({
            id: i.id,
            name: i.name ?? '',
            description: i.description ?? '',
            _isNew: false,
            _isDeleted: false,
          }))
        );
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  updateBoxName(value: string): void {
    this.boxName.set(value);
  }

  updateDescription(value: string): void {
    this.description.set(value);
  }

  updateIdentifier(value: string): void {
    this.identifier.set(value);
  }

  toggleEditItem(id: string): void {
    this.editingItemId.update(current => current === id ? null : id);
  }

  updateItemName(id: string, value: string): void {
    this.editItems.update(items =>
      items.map(i => (i.id === id ? { ...i, name: value } : i))
    );
  }

  updateItemDescription(id: string, value: string): void {
    this.editItems.update(items =>
      items.map(i => (i.id === id ? { ...i, description: value } : i))
    );
  }

  addItem(): void {
    const tempId = 'new_' + Date.now();
    this.editItems.update(items => [
      ...items,
      { id: tempId, name: '', description: '', _isNew: true, _isDeleted: false },
    ]);
    this.editingItemId.set(tempId);
  }

  removeItem(id: string): void {
    this.editItems.update(items =>
      items.map(i => (i.id === id ? { ...i, _isDeleted: true } : i))
    );
    if (this.editingItemId() === id) {
      this.editingItemId.set(null);
    }
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.imagePreview.set(result);
      this.imageBase64.set(result);
    };
    reader.readAsDataURL(file);
  }

  deleteBox(): void {
    if (!confirm('¿Estás seguro de que quieres eliminar esta caja y todo su contenido?')) return;
    this.saving.set(true);
    this.boxesService.delete(this.boxId()).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/boxes']);
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }

  save(): void {
    this.saving.set(true);
    const boxId = this.boxId();

    const pendingItems = this.editItems().filter(i => !i._isDeleted);
    const items: UpdateItemRequest[] = pendingItems.map(item => ({
      name: item.name,
      description: item.description,
    }));

    this.boxesService.update(boxId, {
      name: this.boxName(),
      description: this.description().trim() || undefined,
      identifier: this.identifier(),
      imageBase64: this.imageBase64() ?? undefined,
      items,
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/boxes', boxId]);
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }
}