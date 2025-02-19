/**
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2017-present Ghostery GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import { html } from 'hybrids';

export default {
  render: () => html`
    <template layout="column height::100% width::375px">
      <header layout="row center self:stretch gap:2 height:100px">
        <ui-icon name="logo-full"></ui-icon>
        <ui-icon name="slogan"></ui-icon>
      </header>
      <div layout="grow row content:center margin:0:1:4">
        <div layout="column grow width:::640px">
          <slot></slot>
        </div>
      </div>
    </template>
  `.css`
     :host {
       background: url('data:image/png;base64,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');
     }
 
     header {
       color: var(--ui-color-primary-500);
       background: linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%);
     }
   `,
};
