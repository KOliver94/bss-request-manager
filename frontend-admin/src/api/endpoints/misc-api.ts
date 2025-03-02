/* tslint:disable */
/* eslint-disable */
/**
 * BSS Request Manager API
 * REST API for Workflow Support System for managing video shooting, filming and live streaming requests of Budavári Schönherz Stúdió.
 *
 * The version of the OpenAPI document: 1.0.0
 * Contact: kecskemety.oliver@simonyi.bme.hu
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import type { Configuration } from '../configuration';
import type { AxiosPromise, AxiosInstance, AxiosRequestConfig } from 'axios';
import globalAxios from 'axios';
// Some imports not used depending on template conditions
// @ts-ignore
import {
  DUMMY_BASE_URL,
  assertParamExists,
  setApiKeyToObject,
  setBasicAuthToObject,
  setBearerAuthToObject,
  setOAuthToObject,
  setSearchParams,
  serializeDataIfNeeded,
  toPathString,
  createRequestFunction,
} from '../common';
// @ts-ignore
import {
  BASE_PATH,
  COLLECTION_FORMATS,
  RequestArgs,
  BaseAPI,
  RequiredError,
} from '../base';
// @ts-ignore
import { Contact } from '../models';
// @ts-ignore
import { ContactRequest } from '../models';
/**
 * MiscApi - axios parameter creator
 * @export
 */
export const MiscApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     *
     * @param {ContactRequest} contactRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    miscContactCreate: async (
      contactRequest: ContactRequest,
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'contactRequest' is not null or undefined
      assertParamExists('miscContactCreate', 'contactRequest', contactRequest);
      const localVarPath = `/api/v1/misc/contact`;
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }

      const localVarRequestOptions = {
        method: 'POST',
        ...baseOptions,
        ...options,
      };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      // authentication tokenAuth required
      await setApiKeyToObject(
        localVarHeaderParameter,
        'Authorization',
        configuration,
      );

      // authentication jwtAuth required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      localVarHeaderParameter['Content-Type'] = 'application/json';

      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        contactRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
  };
};

/**
 * MiscApi - functional programming interface
 * @export
 */
export const MiscApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = MiscApiAxiosParamCreator(configuration);
  return {
    /**
     *
     * @param {ContactRequest} contactRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async miscContactCreate(
      contactRequest: ContactRequest,
      options?: AxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<Contact>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.miscContactCreate(
          contactRequest,
          options,
        );
      return createRequestFunction(
        localVarAxiosArgs,
        globalAxios,
        BASE_PATH,
        configuration,
      );
    },
  };
};

/**
 * MiscApi - factory interface
 * @export
 */
export const MiscApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = MiscApiFp(configuration);
  return {
    /**
     *
     * @param {ContactRequest} contactRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    miscContactCreate(
      contactRequest: ContactRequest,
      options?: any,
    ): AxiosPromise<Contact> {
      return localVarFp
        .miscContactCreate(contactRequest, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * MiscApi - object-oriented interface
 * @export
 * @class MiscApi
 * @extends {BaseAPI}
 */
export class MiscApi extends BaseAPI {
  /**
   *
   * @param {ContactRequest} contactRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof MiscApi
   */
  public miscContactCreate(
    contactRequest: ContactRequest,
    options?: AxiosRequestConfig,
  ) {
    return MiscApiFp(this.configuration)
      .miscContactCreate(contactRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }
}
