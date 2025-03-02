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
import { OAuth2ConnectRequest } from '../models';
// @ts-ignore
import { PatchedUserRequest } from '../models';
// @ts-ignore
import { User } from '../models';
// @ts-ignore
import { UserAdminWorkedOn } from '../models';
// @ts-ignore
import { UserRequest } from '../models';
/**
 * MeApi - axios parameter creator
 * @export
 */
export const MeApiAxiosParamCreator = function (configuration?: Configuration) {
  return {
    /**
     *
     * @param {PatchedUserRequest} [patchedUserRequest]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    mePartialUpdate: async (
      patchedUserRequest?: PatchedUserRequest,
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      const localVarPath = `/api/v1/me`;
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }

      const localVarRequestOptions = {
        method: 'PATCH',
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
        patchedUserRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     *
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    meRetrieve: async (
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      const localVarPath = `/api/v1/me`;
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }

      const localVarRequestOptions = {
        method: 'GET',
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

      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     *
     * @param {string} provider
     * @param {OAuth2ConnectRequest} oAuth2ConnectRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    meSocialCreate: async (
      provider: string,
      oAuth2ConnectRequest: OAuth2ConnectRequest,
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'provider' is not null or undefined
      assertParamExists('meSocialCreate', 'provider', provider);
      // verify required parameter 'oAuth2ConnectRequest' is not null or undefined
      assertParamExists(
        'meSocialCreate',
        'oAuth2ConnectRequest',
        oAuth2ConnectRequest,
      );
      const localVarPath = `/api/v1/me/social/{provider}`.replace(
        `{${'provider'}}`,
        encodeURIComponent(String(provider)),
      );
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
        oAuth2ConnectRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     *
     * @param {string} provider
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    meSocialDestroy: async (
      provider: string,
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'provider' is not null or undefined
      assertParamExists('meSocialDestroy', 'provider', provider);
      const localVarPath = `/api/v1/me/social/{provider}`.replace(
        `{${'provider'}}`,
        encodeURIComponent(String(provider)),
      );
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }

      const localVarRequestOptions = {
        method: 'DELETE',
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

      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     *
     * @param {UserRequest} userRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    meUpdate: async (
      userRequest: UserRequest,
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'userRequest' is not null or undefined
      assertParamExists('meUpdate', 'userRequest', userRequest);
      const localVarPath = `/api/v1/me`;
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }

      const localVarRequestOptions = {
        method: 'PUT',
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
        userRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     *
     * @param {boolean} [isResponsible] Default is True.
     * @param {string} [startDatetimeAfter] Default is 20 weeks before start_datetime_before.
     * @param {string} [startDatetimeBefore] Default is today.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    meWorkedOnList: async (
      isResponsible?: boolean,
      startDatetimeAfter?: string,
      startDatetimeBefore?: string,
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      const localVarPath = `/api/v1/me/worked_on`;
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }

      const localVarRequestOptions = {
        method: 'GET',
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

      if (isResponsible !== undefined) {
        localVarQueryParameter['is_responsible'] = isResponsible;
      }

      if (startDatetimeAfter !== undefined) {
        localVarQueryParameter['start_datetime_after'] =
          (startDatetimeAfter as any) instanceof Date
            ? (startDatetimeAfter as any).toISOString().substring(0, 10)
            : startDatetimeAfter;
      }

      if (startDatetimeBefore !== undefined) {
        localVarQueryParameter['start_datetime_before'] =
          (startDatetimeBefore as any) instanceof Date
            ? (startDatetimeBefore as any).toISOString().substring(0, 10)
            : startDatetimeBefore;
      }

      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
  };
};

/**
 * MeApi - functional programming interface
 * @export
 */
export const MeApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = MeApiAxiosParamCreator(configuration);
  return {
    /**
     *
     * @param {PatchedUserRequest} [patchedUserRequest]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async mePartialUpdate(
      patchedUserRequest?: PatchedUserRequest,
      options?: AxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<User>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.mePartialUpdate(
        patchedUserRequest,
        options,
      );
      return createRequestFunction(
        localVarAxiosArgs,
        globalAxios,
        BASE_PATH,
        configuration,
      );
    },
    /**
     *
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async meRetrieve(
      options?: AxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<User>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.meRetrieve(options);
      return createRequestFunction(
        localVarAxiosArgs,
        globalAxios,
        BASE_PATH,
        configuration,
      );
    },
    /**
     *
     * @param {string} provider
     * @param {OAuth2ConnectRequest} oAuth2ConnectRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async meSocialCreate(
      provider: string,
      oAuth2ConnectRequest: OAuth2ConnectRequest,
      options?: AxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.meSocialCreate(
        provider,
        oAuth2ConnectRequest,
        options,
      );
      return createRequestFunction(
        localVarAxiosArgs,
        globalAxios,
        BASE_PATH,
        configuration,
      );
    },
    /**
     *
     * @param {string} provider
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async meSocialDestroy(
      provider: string,
      options?: AxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.meSocialDestroy(
        provider,
        options,
      );
      return createRequestFunction(
        localVarAxiosArgs,
        globalAxios,
        BASE_PATH,
        configuration,
      );
    },
    /**
     *
     * @param {UserRequest} userRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async meUpdate(
      userRequest: UserRequest,
      options?: AxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<User>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.meUpdate(
        userRequest,
        options,
      );
      return createRequestFunction(
        localVarAxiosArgs,
        globalAxios,
        BASE_PATH,
        configuration,
      );
    },
    /**
     *
     * @param {boolean} [isResponsible] Default is True.
     * @param {string} [startDatetimeAfter] Default is 20 weeks before start_datetime_before.
     * @param {string} [startDatetimeBefore] Default is today.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async meWorkedOnList(
      isResponsible?: boolean,
      startDatetimeAfter?: string,
      startDatetimeBefore?: string,
      options?: AxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<Array<UserAdminWorkedOn>>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.meWorkedOnList(
        isResponsible,
        startDatetimeAfter,
        startDatetimeBefore,
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
 * MeApi - factory interface
 * @export
 */
export const MeApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = MeApiFp(configuration);
  return {
    /**
     *
     * @param {PatchedUserRequest} [patchedUserRequest]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    mePartialUpdate(
      patchedUserRequest?: PatchedUserRequest,
      options?: any,
    ): AxiosPromise<User> {
      return localVarFp
        .mePartialUpdate(patchedUserRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    meRetrieve(options?: any): AxiosPromise<User> {
      return localVarFp
        .meRetrieve(options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @param {string} provider
     * @param {OAuth2ConnectRequest} oAuth2ConnectRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    meSocialCreate(
      provider: string,
      oAuth2ConnectRequest: OAuth2ConnectRequest,
      options?: any,
    ): AxiosPromise<void> {
      return localVarFp
        .meSocialCreate(provider, oAuth2ConnectRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @param {string} provider
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    meSocialDestroy(provider: string, options?: any): AxiosPromise<void> {
      return localVarFp
        .meSocialDestroy(provider, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @param {UserRequest} userRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    meUpdate(userRequest: UserRequest, options?: any): AxiosPromise<User> {
      return localVarFp
        .meUpdate(userRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @param {boolean} [isResponsible] Default is True.
     * @param {string} [startDatetimeAfter] Default is 20 weeks before start_datetime_before.
     * @param {string} [startDatetimeBefore] Default is today.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    meWorkedOnList(
      isResponsible?: boolean,
      startDatetimeAfter?: string,
      startDatetimeBefore?: string,
      options?: any,
    ): AxiosPromise<Array<UserAdminWorkedOn>> {
      return localVarFp
        .meWorkedOnList(
          isResponsible,
          startDatetimeAfter,
          startDatetimeBefore,
          options,
        )
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * MeApi - object-oriented interface
 * @export
 * @class MeApi
 * @extends {BaseAPI}
 */
export class MeApi extends BaseAPI {
  /**
   *
   * @param {PatchedUserRequest} [patchedUserRequest]
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof MeApi
   */
  public mePartialUpdate(
    patchedUserRequest?: PatchedUserRequest,
    options?: AxiosRequestConfig,
  ) {
    return MeApiFp(this.configuration)
      .mePartialUpdate(patchedUserRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof MeApi
   */
  public meRetrieve(options?: AxiosRequestConfig) {
    return MeApiFp(this.configuration)
      .meRetrieve(options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @param {string} provider
   * @param {OAuth2ConnectRequest} oAuth2ConnectRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof MeApi
   */
  public meSocialCreate(
    provider: string,
    oAuth2ConnectRequest: OAuth2ConnectRequest,
    options?: AxiosRequestConfig,
  ) {
    return MeApiFp(this.configuration)
      .meSocialCreate(provider, oAuth2ConnectRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @param {string} provider
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof MeApi
   */
  public meSocialDestroy(provider: string, options?: AxiosRequestConfig) {
    return MeApiFp(this.configuration)
      .meSocialDestroy(provider, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @param {UserRequest} userRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof MeApi
   */
  public meUpdate(userRequest: UserRequest, options?: AxiosRequestConfig) {
    return MeApiFp(this.configuration)
      .meUpdate(userRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @param {boolean} [isResponsible] Default is True.
   * @param {string} [startDatetimeAfter] Default is 20 weeks before start_datetime_before.
   * @param {string} [startDatetimeBefore] Default is today.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof MeApi
   */
  public meWorkedOnList(
    isResponsible?: boolean,
    startDatetimeAfter?: string,
    startDatetimeBefore?: string,
    options?: AxiosRequestConfig,
  ) {
    return MeApiFp(this.configuration)
      .meWorkedOnList(
        isResponsible,
        startDatetimeAfter,
        startDatetimeBefore,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
}
