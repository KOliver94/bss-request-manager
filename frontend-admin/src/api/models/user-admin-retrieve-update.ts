/* tslint:disable */
/* eslint-disable */
/**
 * BSS Request Manager API
 * REST API for Workflow Support System for managing video shooting, filming and live streaming requests of Budavári Schönherz Stúdió.
 *
 * The version of the OpenAPI document: 0.1.0
 * Contact: kecskemety.oliver@simonyi.bme.hu
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

// May contain unused imports in some cases
// @ts-ignore
import { BanUser } from './ban-user';
// May contain unused imports in some cases
// @ts-ignore
import { UserProfile } from './user-profile';
// May contain unused imports in some cases
// @ts-ignore
import { UserSocialAuth } from './user-social-auth';

/**
 *
 * @export
 * @interface UserAdminRetrieveUpdate
 */
export interface UserAdminRetrieveUpdate {
  /**
   *
   * @type {BanUser}
   * @memberof UserAdminRetrieveUpdate
   */
  ban: BanUser | null;
  /**
   *
   * @type {string}
   * @memberof UserAdminRetrieveUpdate
   */
  email?: string;
  /**
   *
   * @type {string}
   * @memberof UserAdminRetrieveUpdate
   */
  first_name?: string;
  /**
   *
   * @type {Array<string>}
   * @memberof UserAdminRetrieveUpdate
   */
  groups: Array<string>;
  /**
   *
   * @type {number}
   * @memberof UserAdminRetrieveUpdate
   */
  id: number;
  /**
   *
   * @type {string}
   * @memberof UserAdminRetrieveUpdate
   */
  last_name?: string;
  /**
   *
   * @type {UserProfile}
   * @memberof UserAdminRetrieveUpdate
   */
  profile: UserProfile;
  /**
   *
   * @type {string}
   * @memberof UserAdminRetrieveUpdate
   */
  role: string;
  /**
   *
   * @type {Array<UserSocialAuth>}
   * @memberof UserAdminRetrieveUpdate
   */
  social_accounts: Array<UserSocialAuth>;
  /**
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   * @type {string}
   * @memberof UserAdminRetrieveUpdate
   */
  username: string;
}
