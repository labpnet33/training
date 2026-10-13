var e={id:`troubleshooting`,h:{en:`Troubleshooting: the five-step Vault ladder`,hi:`Troubleshooting: Vault ki paanch step ki seedhi`},body:{en:`
<p>The nightly collector has stopped. Three people say "Vault is broken". It almost never is; one of five small things changed. This chapter gives you a fixed order of questions, and then walks through the four faults of the troubleshoot lab, one after another, the way a real night goes. It is the only troubleshooting chapter, so keep it as your reference.</p>

<h3>An analogy: the front-desk ladder</h3>
<p>You arrive at an office to collect a parcel. Is the building open? Is the desk staffed? Does the guard accept your badge? Is your name on the list for that room? Is the parcel actually there? Each question needs the one before it. If you ask about the parcel when the building is locked, you waste time. Vault is the same ladder.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Five questions in order: can I reach Vault, is it unsealed, who am I, may I read this, does the secret exist"><rect x="10" y="20" width="120" height="54" rx="8" fill="#fecaca"/><text x="70" y="43" text-anchor="middle" class="svg-ink" font-size="13" font-weight="bold">1. Reach</text><text x="70" y="62" text-anchor="middle" class="svg-ink" font-size="11">address, port</text><line x1="130" y1="47" x2="145" y2="47" stroke="#64748b" stroke-width="2"/><text x="70" y="104" text-anchor="middle" class="svg-muted" font-size="11">refused</text><text x="70" y="122" text-anchor="middle" class="svg-muted" font-size="11">VAULT_ADDR</text><rect x="135" y="20" width="120" height="54" rx="8" fill="#fde68a"/><text x="195" y="43" text-anchor="middle" class="svg-ink" font-size="13" font-weight="bold">2. Sealed</text><text x="195" y="62" text-anchor="middle" class="svg-ink" font-size="11">sealed?</text><line x1="255" y1="47" x2="270" y2="47" stroke="#64748b" stroke-width="2"/><text x="195" y="104" text-anchor="middle" class="svg-muted" font-size="11">VaultDown</text><text x="195" y="122" text-anchor="middle" class="svg-muted" font-size="11">unseal</text><rect x="260" y="20" width="120" height="54" rx="8" fill="#bae6fd"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13" font-weight="bold">3. Who</text><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="11">token ok?</text><line x1="380" y1="47" x2="395" y2="47" stroke="#64748b" stroke-width="2"/><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="11">403</text><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="11">new login</text><rect x="385" y="20" width="120" height="54" rx="8" fill="#ddd6fe"/><text x="445" y="43" text-anchor="middle" class="svg-ink" font-size="13" font-weight="bold">4. May I</text><text x="445" y="62" text-anchor="middle" class="svg-ink" font-size="11">mount, policy</text><line x1="505" y1="47" x2="520" y2="47" stroke="#64748b" stroke-width="2"/><text x="445" y="104" text-anchor="middle" class="svg-muted" font-size="11">Forbidden</text><text x="445" y="122" text-anchor="middle" class="svg-muted" font-size="11">fix path/policy</text><rect x="510" y="20" width="120" height="54" rx="8" fill="#bbf7d0"/><text x="570" y="43" text-anchor="middle" class="svg-ink" font-size="13" font-weight="bold">5. Exists</text><text x="570" y="62" text-anchor="middle" class="svg-ink" font-size="11">deleted?</text><text x="570" y="104" text-anchor="middle" class="svg-muted" font-size="11">InvalidPath</text><text x="570" y="122" text-anchor="middle" class="svg-muted" font-size="11">undelete</text><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Go left to right. Stop at the first step that fails; fix it; start again from step 1.</text></svg><p class="cap">The five-step ladder. The error message tells you which step failed, so you never guess.</p></div>
<table class="cmp"><tr><th>Step</th><th>You see</th><th>Meaning</th><th>First check</th></tr><tr><td>1 Reach</td><td><code>connection refused</code>, or the CLI tries an address with <code>s</code> in the scheme</td><td>The client has no address, or the server is down</td><td><code>echo $VAULT_ADDR</code>, <code>vault status</code></td></tr><tr><td>2 Sealed</td><td><code>VaultDown: Vault is sealed</code> (H&#84;TP 503)</td><td>Vault is up but locked after a restart</td><td><code>vault status</code>, line "Sealed"</td></tr><tr><td>3 Who</td><td><code>403 permission denied</code> on everything, even lookup</td><td>The token is wrong, revoked or expired</td><td><code>vault token lookup</code></td></tr><tr><td>4 May I</td><td><code>Forbidden</code> on one path only</td><td>Wrong mount or the policy lacks the path</td><td><code>vault secrets list</code>, <code>vault policy read</code></td></tr><tr><td>5 Exists</td><td><code>InvalidPath</code> (H&#84;TP 404)</td><td>No secret there, or its latest version is deleted</td><td><code>vault kv metadata get</code></td></tr></table>

<h3>Fault 1: the whole job fails after a restart</h3>
<p>The job ends with a long traceback. Read the <b>last line</b> first: it is the answer. The rest is the path the error took.</p>
<pre class="out">AUTO01$ python3 collect.py
    raise exceptions.VaultDown(message, errors=errors, method=method, url=url, text=text, json=json)
hvac.exceptions.VaultDown: Vault is sealed, on get h&#116;tp://10.99.0.70:8200/v1/auth/token/lookup-self</pre>
<p>"Vault is sealed" is step 2. Ask the server, but first check you can reach it at all. In a fresh shell without the address, <code>vault status</code> does not know where to go:</p>
<pre class="out">AUTO01$ vault status
Error checking seal status: Get "h&#116;tps://127.0.0.1:8200/v1/sys/seal-status": dial tcp 127.0.0.1:8200: connect: connection refused</pre>
<p>It tries <code>127.0.0.1</code> with TLS, because the address is missing. Give it the address (for the lab the Vault server is at <code>VAULT_ADDR</code> in the job's environment) and ask again:</p>
<pre class="out">AUTO01$ vault status
Key                Value
---                -----
Seal Type          shamir
Initialized        true
<span class="hl">Sealed             true</span>
Total Shares       1
Threshold          1
Unseal Progress    0/1
Unseal Nonce       n/a
Version            1.15.4
Build Date         2023-12-04T17:45:28Z
Storage Type       inmem
HA Enabled         false</pre>
<p>An operator unseals with the key shares. The lab has one share; real Vault has five and needs three, held by different people. Never paste a real key into a ticket or chat.</p>
<pre class="out">AUTO01$ vault operator unseal zQ8mVx3KpL0nYtR5aHc7WdJ2bUe9FgS4oN6iXvB1kMw=
Key             Value
---             -----
Seal Type       shamir
Initialized     true
<span class="hl">Sealed          false</span>
Total Shares    1
Threshold       1
Version         1.15.4
Build Date      2023-12-04T17:45:28Z
Storage Type    inmem
Cluster Name    vault-cluster-db6309c9
Cluster ID      3063b14c-f54c-48c1-810d-20d14f69c0f8
HA Enabled      false</pre>

<h3>Fault 2: "permission denied" on everything</h3>
<p>Now the script reaches Vault, but stops before any secret, with a message from our own helper. The helper called <code>is_authenticated()</code> and Vault said no. The token is the suspect.</p>
<pre class="out">AUTO01$ python3 collect.py
vclient: the token in .env is not accepted by Vault</pre>
<pre class="code">"""vclient.py - the team's Vault helper. Written in a hurry: it uses the token from .env."""
import sys

import hvac
from dotenv import load_dotenv

load_dotenv()


def connect():
    client = hvac.Client()      <span class="c"># VAULT_ADDR and VAULT_TOKEN come from .env</span>
    if not client.is_authenticated():
        sys.exit("vclient: the token in .env is not accepted by Vault")
    return client</pre>
<p>The helper takes whatever <code>VAULT_TOKEN</code> is in <code>.env</code>. Check that the file has one, without displaying its value in a real incident (here it is a made-up lab value):</p>
<pre class="out">AUTO01$ grep VAULT_TOKEN .env
VAULT_TOKEN=hvs.CAESIlab0expired0token0001</pre>
<pre class="out">AUTO01$ VAULT_TOKEN=hvs.CAESIlab0expired0token0001 vault token lookup
Error looking up token: Error making API request.

URL: GET h&#116;tp://10.99.0.70:8200/v1/auth/token/lookup-self
Code: 403. Errors:

* permission denied</pre>
<p>A token that gives 403 even for its own lookup is dead: expired, revoked, or never valid. The fix is not to ask for a longer token; it is to stop storing a token at all. Replace the helper with an AppRole login (chapters 6 and 7) so every run gets a fresh one:</p>
<pre class="code">"""vclient.py - the team's Vault helper: AppRole login, no stored token."""
import os

import hvac
from dotenv import load_dotenv

load_dotenv()
FOLDER = os.path.expanduser("~/vault-creds")


def _read(name):
    with open(os.path.join(FOLDER, name)) as f:
        return f.read().strip()


def connect():
    client = hvac.Client()
    client.auth.approle.login(role_id=_read("role_id"), secret_id=_read("secret_id"))
    return client</pre>

<h3>Fault 3: Forbidden on one path</h3>
<p>The login works now, but the first secret read fails. Only one request is refused, which points at step 4.</p>
<pre class="out">AUTO01$ python3 collect.py
	* permission denied

, on get h&#116;tp://10.99.0.70:8200/v1/kv/data/net/r1</pre>
<p>Read the URL at the end: <code>/v1/kv/data/net/r1</code>. The first word after <code>v1</code> is the mount. The helper has a constant for it:</p>
<pre class="code">"""creds.py - read one device secret from Vault (KV version 2)."""
MOUNT = "kv"


def get_creds(client, path):
    reply = client.secrets.kv.v2.read_secret_version(path=path, mount_point=MOUNT)
    return reply["data"]["data"]</pre>
<pre class="out">AUTO01$ vault secrets list
Path          Type         Accessor              Description
----          ----         --------              -----------
cubbyhole/    cubbyhole    cubbyhole_00167ef4    per-token private secret storage
identity/     identity     identity_fc137bbe     identity store
<span class="hl">secret/       kv</span>           kv_35871571           key/value secret storage
sys/          system       system_0de1d9b2       system endpoints used for control, policy and debugging</pre>
<p>The KV engine is mounted at <code>secret/</code>, not <code>kv/</code>. Change <code>MOUNT = "kv"</code> to <code>MOUNT = "secret"</code> and run again. A limited token gets Forbidden, not "not found", for a mount it has no rights on (real Vault does this on purpose, so the answer does not reveal what exists). A root token would have said <code>InvalidPath</code>.</p>
<pre class="out">AUTO01$ python3 collect.py
R1   cisco_ios      PUN-CORE-R1#
J1   juniper_junos  netops@J1&gt;
N1   cisco_nxos     N1#</pre>

<h3>Fault 4: one device suddenly "does not exist"</h3>
<p>Next night R1 and J1 work and N1 fails with <code>InvalidPath: None</code>. The mount and the policy are fine, so step 5. A nightly clean-up job ran earlier:</p>
<pre class="code">"""tidy_vault.py - nightly clean-up: soft-delete the secrets of decommissioned devices."""
import hvac

RETIRED = ["n1"]            <span class="c"># devices that were switched off this week</span>

client = hvac.Client()      <span class="c"># VAULT_ADDR from the shell, the job's token in VAULT_TOKEN</span>
for name in RETIRED:
    client.secrets.kv.v2.delete_latest_version_of_secret(path=f"net/{name}")
    print(f"soft-deleted net/{name}")</pre>
<pre class="out">AUTO01$ python3 tidy_vault.py
soft-deleted net/n1
AUTO01$ python3 collect.py
    raise exceptions.InvalidPath(message, errors=errors, method=method, url=url, text=text, json=json)
hvac.exceptions.InvalidPath: None, on get h&#116;tp://10.99.0.70:8200/v1/secret/data/net/n1</pre>
<p>The clean-up soft-deleted N1, but N1 was not retired in the inventory. A soft delete does not remove anything: it stamps the version with a deletion time. See it in the metadata:</p>
<pre class="out">AUTO01$ vault kv get secret/net/n1
======= Metadata =======
Key                Value
---                -----
created_time       2026-10-11T15:30:47.330624997Z
custom_metadata    &lt;nil&gt;
<span class="hl">deletion_time      2026-10-11T15:31:20.380587004Z</span>
destroyed          false
version            1

No value found at secret/data/net/n1</pre>
<pre class="out">AUTO01$ vault kv metadata get secret/net/n1
========== Metadata ==========
Key                     Value
---                     -----
cas_required            false
created_time            2026-10-11T15:30:47.330419990Z
current_version         1
custom_metadata         &lt;nil&gt;
delete_version_after    0s
max_versions            0
oldest_version          1
updated_time            2026-10-11T15:30:47.330624997Z

====== Version 1 ======
Key              Value
---              -----
created_time     2026-10-11T15:30:47.330624997Z
<span class="hl">deletion_time    2026-10-11T15:31:20.380587004Z</span>
destroyed        false</pre>
<p>Because the data is still there, the repair is one line. Undelete the version, then check that <code>deletion_time</code> says <code>n/a</code> again, then run the collector:</p>
<pre class="out">AUTO01$ vault kv undelete -versions=1 secret/net/n1
Success! Data written to: secret/undelete/net/n1</pre>
<pre class="out">AUTO01$ vault kv metadata get secret/net/n1
========== Metadata ==========
Key                     Value
---                     -----
cas_required            false
created_time            2026-10-11T15:30:47.330419990Z
current_version         1
custom_metadata         &lt;nil&gt;
delete_version_after    0s
max_versions            0
oldest_version          1
updated_time            2026-10-11T15:30:47.330624997Z

====== Version 1 ======
Key              Value
---              -----
created_time     2026-10-11T15:30:47.330624997Z
<span class="hl">deletion_time    n/a</span>
destroyed        false</pre>
<pre class="out">AUTO01$ python3 collect.py
R1   cisco_ios      PUN-CORE-R1#
J1   juniper_junos  netops@J1&gt;
N1   cisco_nxos     N1#</pre>
<p>If it had been <code>destroy</code>, there would be no way back (chapter 4). The right long-term fix is that the clean-up reads the inventory, not a list typed in a script.</p>

<div class="warn"><p><b>Common mistake.</b> Jumping to step 5 or 4 because "the secret must have been deleted". Climb the ladder in order. Half of the night-time pages are a sealed Vault or an expired token, and those need no change in any secret.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> The stale token is stale by fiat: the lab clock does not move when Python sleeps, so the fault is placed in <code>.env</code> instead of waiting for real expiry. The deleted secret is made by running <code>tidy.py</code> once with the admin token of the lab, since a lab cannot start with a deleted version. Real Vault also keeps an audit log that names who did the delete; the lab has none. Timestamps and cluster IDs change on every run.</p></div>
<div class="tip"><p><b>Ticket habit.</b> Write the failing step in the ticket title, for example "Vault sealed after restart" or "kv mount wrong in creds.py". It gets to the right person in one hop.</p></div>

<div class="scn"><h4>The 03:10 page</h4><p>The on-call engineer got an alert at 03:10: the collector failed on all 60 devices. She did not touch a secret. Step 1 passed; at step 2 <code>vault status</code> showed "Sealed true" after a host patch reboot. Two key holders were woken and unsealed it by 03:25, and the collector ran at 03:30 without any change. The post-incident ticket asked for auto-unseal.</p><p><b>Lesson:</b> The ladder found the cause in two minutes because it started at the top.</p></div>

<div class="iv"><p class="q">"A Python job that read Vault yesterday now fails. How do you troubleshoot?"</p><p>I read the last line of the traceback and put it on the ladder. Cannot connect: check VAULT_ADDR and vault status. 503 sealed: unseal with the key holders. 403 on everything: the token is dead; use a fresh AppRole login. Forbidden on one path: check the mount and the policy paths. InvalidPath: look at kv metadata for a deletion_time and undelete if it is soft-deleted. I fix one step at a time and rerun.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Use the ladder: reach, sealed, who, may I, exists. Stop at the first failure.</li><li>Read the last line of a traceback first; match it to <code>VaultDown</code>, <code>403</code>, <code>Forbidden</code> or <code>InvalidPath</code>.</li><li>Sealed is a state, not damage: <code>vault operator unseal</code> with the key shares fixes it.</li><li>A soft-deleted version is recovered with <code>kv undelete</code>; destroyed is gone.</li><li>Never print a token or key in a ticket; confirm only that it exists and what it can do.</li></ul></div>
`,hi:`
<p>Raat ka collector ruk gaya hai. Teen log kehte hain "Vault kharab hai". Lagbhag kabhi nahi hota; paanch chhoti cheezon mein se ek badli hoti hai. Yeh chapter sawaalon ka ek tay kram deta hai, aur phir troubleshoot lab ke chaar faults ek ke baad ek chalata hai, jaise asli raat hoti hai. Yeh akela troubleshooting chapter hai, isliye ise apna reference rakho.</p>

<h3>Ek analogy: front-desk ki seedhi</h3>
<p>Tum parcel lene office pahunche. Kya building khuli hai? Kya desk par koi hai? Kya guard tumhara badge maanta hai? Kya us kamre ki list mein tumhara naam hai? Kya parcel sach mein wahan hai? Har sawaal ko pichhle ki zaroorat hai. Building band ho aur tum parcel ke baare mein poochho to waqt jaata hai. Vault bhi yahi seedhi hai.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Paanch sawaal kram se: Vault tak pahunch, unsealed hai, main kaun, padh sakta hoon, secret hai"><rect x="10" y="20" width="120" height="54" rx="8" fill="#fecaca"/><text x="70" y="43" text-anchor="middle" class="svg-ink" font-size="13" font-weight="bold">1. Pahunch</text><text x="70" y="62" text-anchor="middle" class="svg-ink" font-size="11">address, port</text><line x1="130" y1="47" x2="145" y2="47" stroke="#64748b" stroke-width="2"/><text x="70" y="104" text-anchor="middle" class="svg-muted" font-size="11">refused</text><text x="70" y="122" text-anchor="middle" class="svg-muted" font-size="11">VAULT_ADDR</text><rect x="135" y="20" width="120" height="54" rx="8" fill="#fde68a"/><text x="195" y="43" text-anchor="middle" class="svg-ink" font-size="13" font-weight="bold">2. Sealed</text><text x="195" y="62" text-anchor="middle" class="svg-ink" font-size="11">sealed?</text><line x1="255" y1="47" x2="270" y2="47" stroke="#64748b" stroke-width="2"/><text x="195" y="104" text-anchor="middle" class="svg-muted" font-size="11">VaultDown</text><text x="195" y="122" text-anchor="middle" class="svg-muted" font-size="11">unseal</text><rect x="260" y="20" width="120" height="54" rx="8" fill="#bae6fd"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13" font-weight="bold">3. Kaun</text><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="11">token theek?</text><line x1="380" y1="47" x2="395" y2="47" stroke="#64748b" stroke-width="2"/><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="11">403</text><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="11">naya login</text><rect x="385" y="20" width="120" height="54" rx="8" fill="#ddd6fe"/><text x="445" y="43" text-anchor="middle" class="svg-ink" font-size="13" font-weight="bold">4. Ijazat</text><text x="445" y="62" text-anchor="middle" class="svg-ink" font-size="11">mount, policy</text><line x1="505" y1="47" x2="520" y2="47" stroke="#64748b" stroke-width="2"/><text x="445" y="104" text-anchor="middle" class="svg-muted" font-size="11">Forbidden</text><text x="445" y="122" text-anchor="middle" class="svg-muted" font-size="11">path/policy theek</text><rect x="510" y="20" width="120" height="54" rx="8" fill="#bbf7d0"/><text x="570" y="43" text-anchor="middle" class="svg-ink" font-size="13" font-weight="bold">5. Hai?</text><text x="570" y="62" text-anchor="middle" class="svg-ink" font-size="11">deleted?</text><text x="570" y="104" text-anchor="middle" class="svg-muted" font-size="11">InvalidPath</text><text x="570" y="122" text-anchor="middle" class="svg-muted" font-size="11">undelete</text><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Left se right chalo. Pehle fail hone wale step par ruko; theek karo; step 1 se phir shuru karo.</text></svg><p class="cap">Paanch step ki seedhi. Error message batata hai kaunsa step fail hua, isliye andaza nahi lagana padta.</p></div>
<table class="cmp"><tr><th>Step</th><th>Tum dekhte ho</th><th>Matlab</th><th>Pehli jaanch</th></tr><tr><td>1 Pahunch</td><td><code>connection refused</code>, ya CLI aisa address try kare jisme scheme mein <code>s</code> ho</td><td>Client ke paas address nahi, ya server down hai</td><td><code>echo $VAULT_ADDR</code>, <code>vault status</code></td></tr><tr><td>2 Sealed</td><td><code>VaultDown: Vault is sealed</code> (H&#84;TP 503)</td><td>Vault chal raha hai par restart ke baad locked hai</td><td><code>vault status</code>, "Sealed" wali line</td></tr><tr><td>3 Kaun</td><td>Sab par <code>403 permission denied</code>, lookup par bhi</td><td>Token galat, revoke ya expire ho gaya</td><td><code>vault token lookup</code></td></tr><tr><td>4 Ijazat</td><td>Sirf ek path par <code>Forbidden</code></td><td>Galat mount ya policy mein path nahi</td><td><code>vault secrets list</code>, <code>vault policy read</code></td></tr><tr><td>5 Hai?</td><td><code>InvalidPath</code> (H&#84;TP 404)</td><td>Wahan secret nahi, ya latest version deleted hai</td><td><code>vault kv metadata get</code></td></tr></table>

<h3>Fault 1: restart ke baad poora job fail</h3>
<p>Job lambe traceback ke saath khatam hota hai. <b>Aakhri line</b> pehle padho: wahi jawab hai. Baaki woh raasta hai jis se error guzra.</p>
<pre class="out">AUTO01$ python3 collect.py
    raise exceptions.VaultDown(message, errors=errors, method=method, url=url, text=text, json=json)
hvac.exceptions.VaultDown: Vault is sealed, on get h&#116;tp://10.99.0.70:8200/v1/auth/token/lookup-self</pre>
<p>"Vault is sealed" step 2 hai. Server se poochho, par pehle dekho ki wahan pahunch bhi sakte ho. Naye shell mein address ke bina <code>vault status</code> ko pata nahi kahan jaana hai:</p>
<pre class="out">AUTO01$ vault status
Error checking seal status: Get "h&#116;tps://127.0.0.1:8200/v1/sys/seal-status": dial tcp 127.0.0.1:8200: connect: connection refused</pre>
<p>Address na hone se woh TLS ke saath <code>127.0.0.1</code> try karta hai. Address do (lab mein Vault server job ke environment ke <code>VAULT_ADDR</code> par hai) aur phir poochho:</p>
<pre class="out">AUTO01$ vault status
Key                Value
---                -----
Seal Type          shamir
Initialized        true
<span class="hl">Sealed             true</span>
Total Shares       1
Threshold          1
Unseal Progress    0/1
Unseal Nonce       n/a
Version            1.15.4
Build Date         2023-12-04T17:45:28Z
Storage Type       inmem
HA Enabled         false</pre>
<p>Operator key shares se unseal karta hai. Lab mein ek share hai; asli Vault mein paanch hote hain aur teen chahiye, alag logon ke paas. Asli key kabhi ticket ya chat mein paste mat karo.</p>
<pre class="out">AUTO01$ vault operator unseal zQ8mVx3KpL0nYtR5aHc7WdJ2bUe9FgS4oN6iXvB1kMw=
Key             Value
---             -----
Seal Type       shamir
Initialized     true
<span class="hl">Sealed          false</span>
Total Shares    1
Threshold       1
Version         1.15.4
Build Date      2023-12-04T17:45:28Z
Storage Type    inmem
Cluster Name    vault-cluster-db6309c9
Cluster ID      3063b14c-f54c-48c1-810d-20d14f69c0f8
HA Enabled      false</pre>

<h3>Fault 2: sab par "permission denied"</h3>
<p>Ab script Vault tak pahunchti hai, par kisi secret se pehle hamare helper ke message ke saath ruk jaati hai. Helper ne <code>is_authenticated()</code> call kiya aur Vault ne mana kar diya. Shak token par hai.</p>
<pre class="out">AUTO01$ python3 collect.py
vclient: the token in .env is not accepted by Vault</pre>
<pre class="code">"""vclient.py - the team's Vault helper. Written in a hurry: it uses the token from .env."""
import sys

import hvac
from dotenv import load_dotenv

load_dotenv()


def connect():
    client = hvac.Client()      <span class="c"># VAULT_ADDR and VAULT_TOKEN come from .env</span>
    if not client.is_authenticated():
        sys.exit("vclient: the token in .env is not accepted by Vault")
    return client</pre>
<p>Helper <code>.env</code> mein jo bhi <code>VAULT_TOKEN</code> ho use le leta hai. Dekho file mein ek hai, asli incident mein uski value dikhaye bina (yahan woh banayi hui lab value hai):</p>
<pre class="out">AUTO01$ grep VAULT_TOKEN .env
VAULT_TOKEN=hvs.CAESIlab0expired0token0001</pre>
<pre class="out">AUTO01$ VAULT_TOKEN=hvs.CAESIlab0expired0token0001 vault token lookup
Error looking up token: Error making API request.

URL: GET h&#116;tp://10.99.0.70:8200/v1/auth/token/lookup-self
Code: 403. Errors:

* permission denied</pre>
<p>Jo token apne lookup par bhi 403 de, woh mar chuka hai: expire, revoke, ya kabhi valid hi nahi tha. Fix lamba token maangna nahi; token store karna hi band karna hai. Helper ko AppRole login se badlo (chapter 6 aur 7) taaki har run ko naya mile:</p>
<pre class="code">"""vclient.py - the team's Vault helper: AppRole login, no stored token."""
import os

import hvac
from dotenv import load_dotenv

load_dotenv()
FOLDER = os.path.expanduser("~/vault-creds")


def _read(name):
    with open(os.path.join(FOLDER, name)) as f:
        return f.read().strip()


def connect():
    client = hvac.Client()
    client.auth.approle.login(role_id=_read("role_id"), secret_id=_read("secret_id"))
    return client</pre>

<h3>Fault 3: ek path par Forbidden</h3>
<p>Login ab chalta hai, par pehla secret read fail hota hai. Sirf ek request mana hui, jo step 4 ki taraf ishara karta hai.</p>
<pre class="out">AUTO01$ python3 collect.py
	* permission denied

, on get h&#116;tp://10.99.0.70:8200/v1/kv/data/net/r1</pre>
<p>Aakhir ka URL padho: <code>/v1/kv/data/net/r1</code>. <code>v1</code> ke baad pehla shabd mount hai. Helper mein uska constant hai:</p>
<pre class="code">"""creds.py - read one device secret from Vault (KV version 2)."""
MOUNT = "kv"


def get_creds(client, path):
    reply = client.secrets.kv.v2.read_secret_version(path=path, mount_point=MOUNT)
    return reply["data"]["data"]</pre>
<pre class="out">AUTO01$ vault secrets list
Path          Type         Accessor              Description
----          ----         --------              -----------
cubbyhole/    cubbyhole    cubbyhole_00167ef4    per-token private secret storage
identity/     identity     identity_fc137bbe     identity store
<span class="hl">secret/       kv</span>           kv_35871571           key/value secret storage
sys/          system       system_0de1d9b2       system endpoints used for control, policy and debugging</pre>
<p>KV engine <code>secret/</code> par mount hai, <code>kv/</code> par nahi. <code>MOUNT = "kv"</code> ko <code>MOUNT = "secret"</code> karo aur dobara chalao. Limited token ko jis mount par haq nahi uspar "not found" nahi, Forbidden milta hai (asli Vault jaan-boojh kar aisa karta hai, taaki jawab se pata na chale kya maujood hai). Root token <code>InvalidPath</code> kehta.</p>
<pre class="out">AUTO01$ python3 collect.py
R1   cisco_ios      PUN-CORE-R1#
J1   juniper_junos  netops@J1&gt;
N1   cisco_nxos     N1#</pre>

<h3>Fault 4: ek device achanak "exist nahi karta"</h3>
<p>Agli raat R1 aur J1 chalte hain aur N1 <code>InvalidPath: None</code> se fail hota hai. Mount aur policy theek hain, to step 5. Pehle ek nightly clean-up job chali thi:</p>
<pre class="code">"""tidy_vault.py - nightly clean-up: soft-delete the secrets of decommissioned devices."""
import hvac

RETIRED = ["n1"]            <span class="c"># devices that were switched off this week</span>

client = hvac.Client()      <span class="c"># VAULT_ADDR from the shell, the job's token in VAULT_TOKEN</span>
for name in RETIRED:
    client.secrets.kv.v2.delete_latest_version_of_secret(path=f"net/{name}")
    print(f"soft-deleted net/{name}")</pre>
<pre class="out">AUTO01$ python3 tidy_vault.py
soft-deleted net/n1
AUTO01$ python3 collect.py
    raise exceptions.InvalidPath(message, errors=errors, method=method, url=url, text=text, json=json)
hvac.exceptions.InvalidPath: None, on get h&#116;tp://10.99.0.70:8200/v1/secret/data/net/n1</pre>
<p>Clean-up ne N1 ko soft-delete kar diya, par inventory mein N1 retire nahi hua tha. Soft delete kuch hatata nahi: woh version par deletion time ki mohar lagata hai. Metadata mein dekho:</p>
<pre class="out">AUTO01$ vault kv get secret/net/n1
======= Metadata =======
Key                Value
---                -----
created_time       2026-10-11T15:30:47.330624997Z
custom_metadata    &lt;nil&gt;
<span class="hl">deletion_time      2026-10-11T15:31:20.380587004Z</span>
destroyed          false
version            1

No value found at secret/data/net/n1</pre>
<pre class="out">AUTO01$ vault kv metadata get secret/net/n1
========== Metadata ==========
Key                     Value
---                     -----
cas_required            false
created_time            2026-10-11T15:30:47.330419990Z
current_version         1
custom_metadata         &lt;nil&gt;
delete_version_after    0s
max_versions            0
oldest_version          1
updated_time            2026-10-11T15:30:47.330624997Z

====== Version 1 ======
Key              Value
---              -----
created_time     2026-10-11T15:30:47.330624997Z
<span class="hl">deletion_time    2026-10-11T15:31:20.380587004Z</span>
destroyed        false</pre>
<p>Data abhi maujood hai, isliye repair ek line hai. Version undelete karo, dekho <code>deletion_time</code> phir <code>n/a</code> hai, phir collector chalao:</p>
<pre class="out">AUTO01$ vault kv undelete -versions=1 secret/net/n1
Success! Data written to: secret/undelete/net/n1</pre>
<pre class="out">AUTO01$ vault kv metadata get secret/net/n1
========== Metadata ==========
Key                     Value
---                     -----
cas_required            false
created_time            2026-10-11T15:30:47.330419990Z
current_version         1
custom_metadata         &lt;nil&gt;
delete_version_after    0s
max_versions            0
oldest_version          1
updated_time            2026-10-11T15:30:47.330624997Z

====== Version 1 ======
Key              Value
---              -----
created_time     2026-10-11T15:30:47.330624997Z
<span class="hl">deletion_time    n/a</span>
destroyed        false</pre>
<pre class="out">AUTO01$ python3 collect.py
R1   cisco_ios      PUN-CORE-R1#
J1   juniper_junos  netops@J1&gt;
N1   cisco_nxos     N1#</pre>
<p>Agar <code>destroy</code> hota to wapas jaane ka koi raasta nahi (chapter 4). Lambi muddat ka sahi fix yeh hai ki clean-up inventory padhe, script mein typed list nahi.</p>

<div class="warn"><p><b>Aam galti.</b> "Secret delete hua hoga" soch kar seedha step 5 ya 4 par koodna. Seedhi kram se chadho. Raat ke aadhe pages sealed Vault ya expired token hote hain, jinke liye kisi secret mein badlaav nahi chahiye.</p></div>
<div class="note"><p><b>Lab mein aur asli gear par.</b> Stale token "hukm se" stale hai: Python ke sleep karne par lab ki clock nahi chalti, isliye asli expiry ka intezaar karne ke bajay fault <code>.env</code> mein rakha gaya hai. Deleted secret <code>tidy.py</code> ko lab ke admin token se ek baar chalakar banta hai, kyunki lab deleted version ke saath shuru nahi ho sakti. Asli Vault audit log bhi rakhta hai jo batata hai delete kisne kiya; lab mein nahi hai. Timestamps aur cluster ID har run par badalte hain.</p></div>
<div class="tip"><p><b>Ticket ki aadat.</b> Ticket ke title mein fail hone wala step likho, jaise "restart ke baad Vault sealed" ya "creds.py mein kv mount galat". Sahi insaan tak ek hi hop mein pahunchta hai.</p></div>

<div class="scn"><h4>03:10 ka page</h4><p>On-call engineer ko 03:10 par alert mila: collector 60 mein se sabhi devices par fail. Usne koi secret nahi chhua. Step 1 pass hua; step 2 par <code>vault status</code> ne host patch reboot ke baad "Sealed true" dikhaya. Do key holders ko jagaya gaya aur 03:25 tak unseal ho gaya, aur collector 03:30 par bina kisi badlaav ke chala. Incident ke baad ke ticket mein auto-unseal maanga gaya.</p><p><b>Seekh:</b> Seedhi ne do minute mein wajah dhoondh li kyunki woh upar se shuru hui.</p></div>

<div class="iv"><p class="q">"Jo Python job kal Vault padh raha tha woh aaj fail hai. Kaise troubleshoot karoge?"</p><p>Main traceback ki aakhri line padhta hoon aur use seedhi par rakhta hoon. Cannot connect: VAULT_ADDR aur vault status dekho. 503 sealed: key holders se unseal karwao. Sab par 403: token mar chuka hai; naya AppRole login use karo. Ek path par Forbidden: mount aur policy paths dekho. InvalidPath: kv metadata mein deletion_time dekho aur soft-deleted ho to undelete karo. Ek ek step theek karke dobara chalata hoon.</p></div>

<div class="kt"><p><b>Mukhya baatein</b></p><ul><li>Seedhi use karo: pahunch, sealed, kaun, ijazat, hai. Pehle fail par ruko.</li><li>Traceback ki aakhri line pehle padho; use <code>VaultDown</code>, <code>403</code>, <code>Forbidden</code> ya <code>InvalidPath</code> se milao.</li><li>Sealed ek state hai, nuksan nahi: key shares ke saath <code>vault operator unseal</code> use theek karta hai.</li><li>Soft-deleted version <code>kv undelete</code> se wapas aata hai; destroyed khatam.</li><li>Ticket mein token ya key kabhi print mat karo; sirf confirm karo ki hai aur kya kar sakta hai.</li></ul></div>
`}};export{e as default};