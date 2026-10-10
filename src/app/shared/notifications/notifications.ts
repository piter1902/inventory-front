import { Component, inject } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  imports: [],
  templateUrl: './notifications.html',
})
export class Notifications {
  protected readonly notificationService = inject(NotificationService);
}
