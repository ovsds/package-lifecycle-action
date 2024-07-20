export const userTypes = ["User", "Organization"] as const;
export type UserTypeLiteral = (typeof userTypes)[number];
export const parseUserType = (value: string): UserTypeLiteral => {
  if (userTypes.includes(value as UserTypeLiteral)) {
    return value as UserTypeLiteral;
  }
  throw new Error(`Invalid user type: ${value}`);
};

export interface User {
  login: string;
  type: UserTypeLiteral;
}

export const packageTypes = ["container"] as const;
export type PackageTypeLiteral = (typeof packageTypes)[number];
export const parsePackageType = (value: string): PackageTypeLiteral => {
  if (packageTypes.includes(value as PackageTypeLiteral)) {
    return value as PackageTypeLiteral;
  }
  throw new Error(`Invalid package type: ${value}`);
};

export interface PackageVersion {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface ReasonedPackageVersion {
  version: PackageVersion;
  reason: string;
}

export const PackageVersionState = ["active", "deleted"] as const;
export type PackageVersionStateLiteral = (typeof PackageVersionState)[number];
