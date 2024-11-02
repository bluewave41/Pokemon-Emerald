type Permission = {
  impassable: boolean;
};

export const PERMISSIONS: Record<number, Permission> = {
  0: {
    impassable: false,
  },
  1: {
    impassable: true,
  },
};
