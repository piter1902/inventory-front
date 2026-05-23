import { routes } from './app.routes';

describe('App Routes', () => {
  it('should define all top-level routes', () => {
    expect(routes.length).toBe(4);
  });

  it('should redirect empty path to boxes', () => {
    const route = routes[0];
    expect(route.path).toBe('');
    expect(route.redirectTo).toBe('boxes');
    expect(route.pathMatch).toBe('full');
  });

  it('should have auth/callback route with loadComponent', () => {
    const route = routes[1];
    expect(route.path).toBe('auth/callback');
    expect(route.loadComponent).toBeDefined();
  });

  it('should have unauthorized route with loadComponent', () => {
    const route = routes[2];
    expect(route.path).toBe('unauthorized');
    expect(route.loadComponent).toBeDefined();
  });

  it('should have guarded layout route with authGuard and children', () => {
    const route = routes[3];
    expect(route.path).toBe('');
    expect(route.canActivate).toBeDefined();
    expect(route.canActivate!.length).toBe(1);
    expect(route.loadComponent).toBeDefined();
    expect(route.children).toBeDefined();
    expect(route.children!.length).toBe(12);
  });

  it('should define boxes/new child route', () => {
    const children = routes[3].children!;
    const boxNew = children[0];
    expect(boxNew.path).toBe('boxes/new');
    expect(boxNew.loadComponent).toBeDefined();
  });

  it('should define boxes child route with showBack data', () => {
    const children = routes[3].children!;
    const boxes = children[1];
    expect(boxes.path).toBe('boxes');
    expect(boxes.data).toEqual({ showBack: false });
    expect(boxes.loadComponent).toBeDefined();
  });

  it('should define boxes/:boxId child route', () => {
    const children = routes[3].children!;
    const boxDetail = children[2];
    expect(boxDetail.path).toBe('boxes/:boxId');
    expect(boxDetail.loadComponent).toBeDefined();
  });

  it('should define search child route with showBack data', () => {
    const children = routes[3].children!;
    const search = children[3];
    expect(search.path).toBe('search');
    expect(search.data).toEqual({ showBack: false });
    expect(search.loadComponent).toBeDefined();
  });

  it('should define boxes/:boxId/edit child route', () => {
    const children = routes[3].children!;
    const edit = children[4];
    expect(edit.path).toBe('boxes/:boxId/edit');
    expect(edit.loadComponent).toBeDefined();
  });

  it('should define zones child route with showBack data', () => {
    const children = routes[3].children!;
    const zones = children[5];
    expect(zones.path).toBe('zones');
    expect(zones.data).toEqual({ showBack: false });
    expect(zones.loadComponent).toBeDefined();
  });

  it('should define zones/new child route', () => {
    const children = routes[3].children!;
    const zoneNew = children[6];
    expect(zoneNew.path).toBe('zones/new');
    expect(zoneNew.loadComponent).toBeDefined();
  });

  it('should define zones/:zoneId child route', () => {
    const children = routes[3].children!;
    const zoneDetail = children[7];
    expect(zoneDetail.path).toBe('zones/:zoneId');
    expect(zoneDetail.loadComponent).toBeDefined();
  });

  it('should define zones/:zoneId/edit child route', () => {
    const children = routes[3].children!;
    const zoneEdit = children[8];
    expect(zoneEdit.path).toBe('zones/:zoneId/edit');
    expect(zoneEdit.loadComponent).toBeDefined();
  });

  it('should define import child route with showBack data', () => {
    const children = routes[3].children!;
    const importRoute = children[9];
    expect(importRoute.path).toBe('import');
    expect(importRoute.data).toEqual({ showBack: false });
    expect(importRoute.loadComponent).toBeDefined();
  });

  it('should define boxes/:boxId/move-items child route', () => {
    const children = routes[3].children!;
    const moveItems = children[10];
    expect(moveItems.path).toBe('boxes/:boxId/move-items');
    expect(moveItems.loadComponent).toBeDefined();
  });

  it('should define logs child route with showBack data', () => {
    const children = routes[3].children!;
    const logs = children[11];
    expect(logs.path).toBe('logs');
    expect(logs.data).toEqual({ showBack: false });
    expect(logs.loadComponent).toBeDefined();
  });
});
