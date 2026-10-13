var e={id:`feed-netmiko`,h:{en:`Feeding Vault secrets to netmiko`,hi:`Vault secrets ko netmiko tak pahunchana`},body:{en:`
<p>Now the pay-off. The collector from <code>adv-nkmiko</code> needs a user name and a password for each device. Until now they came from <code>.env</code>. In this chapter they come from Vault at the moment the script runs, live only in variables, and the file is emptied of passwords. This is configure-lab tasks 5, 6 and 7.</p>

<h3>An analogy: the waiter and the safe</h3>
<p>A good waiter does not carry the guests' keys around all day. He fetches the one he needs when the guest asks, uses it, and puts it back. Our script does the same: fetch at the moment of use, keep only in a local variable, never write it anywhere.</p>

<h3>The helper: vault_creds.py</h3>
<p>One small module holds everything about Vault, so no other script needs to know about AppRole or mount points. The same module can feed <code>netmiko</code> today and, in <code>adv-napalm</code>, the NAPALM driver tomorrow.</p>
<pre class="code">"""vault_creds.py - fetch device credentials from Vault at run time (AppRole login)."""
import os

import hvac
from dotenv import load_dotenv
from hvac.exceptions import InvalidPath

load_dotenv()                                   <span class="c"># VAULT_ADDR from .env</span>
FOLDER = os.path.expanduser("~/vault-creds")


def _read(name):
    with open(os.path.join(FOLDER, name)) as f:
        return f.read().strip()


def vault_client():
    """A client holding a short-lived token from an AppRole login."""
    client = hvac.Client()
    client.auth.approle.login(role_id=_read("role_id"), secret_id=_read("secret_id"))
    return client


def get_creds(client, path):
    """Return the secret at secret/&lt;path&gt; as a dict, for example {'user': ..., 'password': ...}."""
    try:
        reply = client.secrets.kv.v2.read_secret_version(path=path, mount_point="secret")
    except InvalidPath:
        raise LookupError(f"no secret at secret/{path}") from None
    return reply["data"]["data"]</pre>
<p>Three details matter. <code>load_dotenv()</code> only reads the Vault address, which is not a secret. <code>vault_client()</code> logs in with the two files and returns a client that already holds the token. <code>get_creds()</code> turns the unhelpful <code>InvalidPath</code> into a <code>LookupError</code> that names the secret, using <code>from None</code> so the traceback is short. Now a check script that proves the least-privilege design, printing a length and never a password:</p>
<pre class="code">from hvac.exceptions import Forbidden
from vault_creds import vault_client, get_creds

client = vault_client()
info = client.auth.token.lookup_self()["data"]
print("policies:", sorted(info["policies"]))
creds = get_creds(client, "net/r1")
print("net/r1 user:", creds["user"], "| password length:", len(creds["password"]))
try:
    client.secrets.kv.v2.create_or_update_secret(path="net/r1", secret={"user": "intruder"})
except Forbidden as err:
    print("write refused:", type(err).__name__)</pre>
<pre class="out">AUTO01$ python3 whoami.py
<span class="hl">policies: ['default', 'net-read']</span>
net/r1 user: netops | <span class="hl">password length: 7</span>
<span class="hl">write refused: Forbidden</span></pre>
<p>The token carries <code>net-read</code> (and the <code>default</code> policy Vault adds to every token). It reads <code>net/r1</code> and is refused a write, as designed. The friendly error looks like this:</p>
<pre class="out">AUTO01$ python3 missing.py
    raise LookupError(f"no secret at secret/{path}") from None
LookupError: no secret at secret/net/zzz</pre>

<h3>The collector</h3>
<p>Here is the whole job: log in once, and for every row of the inventory read the secret named in the last column and connect.</p>
<pre class="code">"""collect.py - connect to every device with credentials fetched from Vault (nothing secret on disk)."""
import csv

from netmiko import ConnectHandler
from vault_creds import vault_client, get_creds

client = vault_client()
with open("inventory.csv") as f:
    rows = list(csv.DictReader(f))
for row in rows:
    creds = get_creds(client, row["vault_path"])
    params = {"device_type": row["device_type"], "host": row["host"],
              "username": creds["user"], "password": creds["password"], "secret": creds["password"]}
    with ConnectHandler(**params) as conn:
        print(f"{row['name']:&lt;4} {row['device_type']:&lt;14} {conn.find_prompt()}")</pre>
<pre class="out">AUTO01$ python3 collect.py
R1   cisco_ios      PUN-CORE-R1#
J1   juniper_junos  netops@J1&gt;
N1   cisco_nxos     N1#</pre>
<p>The inventory file holds a <b>path</b>, not a password: <code>R1,10.99.0.1,cisco_ios,net/r1</code>. N1 has a different password from R1 and J1, and nothing in the script knows that. Per-device secrets come for free.</p>

<h3>Take the passwords out of .env</h3>
<p>Prove the script no longer needs them: delete the three lines that hold secrets, look at the file and run the collector again.</p>
<pre class="code">sed -i '/^NET_/d;/^NXOS_/d' .env</pre>
<pre class="out">AUTO01$ cat .env
VAULT_ADDR=h&#116;tp://10.99.0.70:8200</pre>
<pre class="out">AUTO01$ python3 collect.py
R1   cisco_ios      PUN-CORE-R1#
J1   juniper_junos  netops@J1&gt;
N1   cisco_nxos     N1#</pre>
<p>The only line left is the address of the server. The old passwords still exist in your shell history, backups and old copies of the file; rotate them once, now that nothing depends on them.</p>

<h3>End the token when the work is done</h3>
<p>A token that lives 15 minutes is short, but a script that finishes in 3 seconds can end it now. Append two lines to <code>collect.py</code>:</p>
<pre class="code">client.auth.token.revoke_self()                 <span class="c"># the token has done its job: end it now</span>
print("token revoked, still valid:", client.is_authenticated())</pre>
<pre class="out">AUTO01$ python3 collect.py
R1   cisco_ios      PUN-CORE-R1#
J1   juniper_junos  netops@J1&gt;
N1   cisco_nxos     N1#
<span class="hl">token revoked, still valid: False</span></pre>
<p>After <code>revoke_self()</code>, <code>is_authenticated()</code> is <code>False</code>, and a copy of that token in a log or in memory is worthless.</p>

<h3>The production version</h3>
<p>Real jobs fail, and a failing job must still end its token and say something short. This version wraps the work in <code>try</code> and <code>finally</code> and exits with code 1 when Vault refuses. The second run uses an inventory with a path that has no secret.</p>
<pre class="code">"""collect_safe.py - the same collector; it always ends its token and fails with a short message."""
import csv
import sys

from hvac.exceptions import VaultError
from netmiko import ConnectHandler
from vault_creds import vault_client, get_creds

inventory = sys.argv[1] if len(sys.argv) &gt; 1 else "inventory.csv"
try:
    client = vault_client()
except VaultError as err:
    sys.exit(f"vault login failed: {type(err).__name__}")

try:
    with open(inventory) as f:
        for row in csv.DictReader(f):
            creds = get_creds(client, row["vault_path"])
            params = {"device_type": row["device_type"], "host": row["host"],
                      "username": creds["user"], "password": creds["password"], "secret": creds["password"]}
            with ConnectHandler(**params) as conn:
                print(f"{row['name']:&lt;4} {row['device_type']:&lt;14} {conn.find_prompt()}")
except (VaultError, LookupError) as err:
    sys.exit(f"vault read failed: {err}")
finally:
    client.auth.token.revoke_self()</pre>
<pre class="out">AUTO01$ python3 collect_safe.py
R1   cisco_ios      PUN-CORE-R1#
J1   juniper_junos  netops@J1&gt;
N1   cisco_nxos     N1#
AUTO01$ python3 collect_safe.py bad.csv; echo "exit code: $?"
R1   cisco_ios      PUN-CORE-R1#
vault read failed: no secret at secret/net/zzz
exit code: 1</pre>
<p>Rules to keep:</p>
<ul><li>Fetch the secrets in the main thread and hand plain dictionaries to worker threads; do not share one login between threads you do not control.</li><li>Fail closed: if Vault is down, stop. Never fall back to a password left in a file.</li><li>Keep the password in a local variable; do not log it, print it or put it in an exception message (see <code>py-secrets</code> on redaction).</li><li>One role per kind of job; the collector's token cannot write.</li></ul>

<div class="warn"><p><b>Common mistake.</b> Caching the password in a global or a file "to save a request". You rebuild the copy-everywhere problem. A login and a read cost milliseconds; do them per run.</p></div>
<div class="exam"><p><b>Exam trap.</b> Vault gives the script a token, not the password of the Vault account. Reading the device password and logging in to the device are two separate steps with two separate credentials.</p></div>

<div class="scn"><h4>One script, three passwords, zero files</h4><p>The NOC collector ran every night against 60 devices and needed three different passwords. The old <code>.env</code> was copied to two jump hosts and a laptop. After the move, the file held only the Vault address, the AppRole files were on the one host that runs the job, and when a password changed the NOC wrote one new version in Vault and the next run picked it up. The laptop stopped mattering.</p><p><b>Lesson:</b> The best place for a copy is nowhere.</p></div>

<div class="iv"><p class="q">"How do you give netmiko its credentials from Vault?"</p><p>A helper logs in to Vault with AppRole, reads the secret for the device from its path, and returns user and password in a dictionary. The script builds the netmiko dictionary from that, connects, and drops the variable. The token is revoked at the end, in a finally block, and a Vault error stops the run instead of falling back to a stored password.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Keep all Vault code in one helper: login, read, friendly errors.</li><li>The inventory lists secret <b>paths</b>; passwords live only in Vault and in local variables.</li><li>After the move, <code>.env</code> keeps the address only; rotate the old passwords once.</li><li><code>revoke_self()</code> in a <code>finally</code> block ends the token even when the job fails.</li><li>Fail closed, never print the secret, fetch in the main thread.</li></ul></div>
`,hi:`
<p>Ab fayda. <code>adv-nkmiko</code> ke collector ko har device ke liye user name aur password chahiye. Ab tak woh <code>.env</code> se aate the. Is chapter mein woh script chalte waqt Vault se aate hain, sirf variables mein jeete hain, aur file passwords se khaali ho jaati hai. Yeh configure lab ke tasks 5, 6 aur 7 hain.</p>

<h3>Ek analogy: waiter aur tijori</h3>
<p>Achha waiter mehmano ki chabiyan din bhar saath nahi ghumata. Mehmaan maange to jo chahiye woh laata hai, use karta hai, aur wapas rakh deta hai. Hamari script yahi karti hai: use ke waqt fetch, sirf local variable mein, kahin likhna nahi.</p>

<h3>Helper: vault_creds.py</h3>
<p>Ek chhota module Vault ki saari baatein sambhalta hai, isliye kisi aur script ko AppRole ya mount points ka pata nahi hona chahiye. Wahi module aaj <code>netmiko</code> ko aur <code>adv-napalm</code> mein kal NAPALM driver ko de sakta hai.</p>
<pre class="code">"""vault_creds.py - fetch device credentials from Vault at run time (AppRole login)."""
import os

import hvac
from dotenv import load_dotenv
from hvac.exceptions import InvalidPath

load_dotenv()                                   <span class="c"># VAULT_ADDR from .env</span>
FOLDER = os.path.expanduser("~/vault-creds")


def _read(name):
    with open(os.path.join(FOLDER, name)) as f:
        return f.read().strip()


def vault_client():
    """A client holding a short-lived token from an AppRole login."""
    client = hvac.Client()
    client.auth.approle.login(role_id=_read("role_id"), secret_id=_read("secret_id"))
    return client


def get_creds(client, path):
    """Return the secret at secret/&lt;path&gt; as a dict, for example {'user': ..., 'password': ...}."""
    try:
        reply = client.secrets.kv.v2.read_secret_version(path=path, mount_point="secret")
    except InvalidPath:
        raise LookupError(f"no secret at secret/{path}") from None
    return reply["data"]["data"]</pre>
<p>Teen details zaroori hain. <code>load_dotenv()</code> sirf Vault address padhta hai, jo secret nahi hai. <code>vault_client()</code> do files se login karta hai aur aisa client deta hai jisme token pehle se hai. <code>get_creds()</code> beparwah <code>InvalidPath</code> ko <code>LookupError</code> mein badalta hai jo secret ka naam batata hai, <code>from None</code> ke saath taaki traceback chhota rahe. Ab ek check script jo least-privilege design ko sabit karti hai, password nahi, length print karke:</p>
<pre class="code">from hvac.exceptions import Forbidden
from vault_creds import vault_client, get_creds

client = vault_client()
info = client.auth.token.lookup_self()["data"]
print("policies:", sorted(info["policies"]))
creds = get_creds(client, "net/r1")
print("net/r1 user:", creds["user"], "| password length:", len(creds["password"]))
try:
    client.secrets.kv.v2.create_or_update_secret(path="net/r1", secret={"user": "intruder"})
except Forbidden as err:
    print("write refused:", type(err).__name__)</pre>
<pre class="out">AUTO01$ python3 whoami.py
<span class="hl">policies: ['default', 'net-read']</span>
net/r1 user: netops | <span class="hl">password length: 7</span>
<span class="hl">write refused: Forbidden</span></pre>
<p>Token <code>net-read</code> rakhta hai (aur <code>default</code> policy jo Vault har token mein jodta hai). Woh <code>net/r1</code> padhta hai aur write mana ho jaata hai, jaisa design tha. Dost jaisa error aisa dikhta hai:</p>
<pre class="out">AUTO01$ python3 missing.py
    raise LookupError(f"no secret at secret/{path}") from None
LookupError: no secret at secret/net/zzz</pre>

<h3>Collector</h3>
<p>Poora job yeh hai: ek baar login karo, aur inventory ki har row ke liye aakhri column mein likha secret padho aur connect karo.</p>
<pre class="code">"""collect.py - connect to every device with credentials fetched from Vault (nothing secret on disk)."""
import csv

from netmiko import ConnectHandler
from vault_creds import vault_client, get_creds

client = vault_client()
with open("inventory.csv") as f:
    rows = list(csv.DictReader(f))
for row in rows:
    creds = get_creds(client, row["vault_path"])
    params = {"device_type": row["device_type"], "host": row["host"],
              "username": creds["user"], "password": creds["password"], "secret": creds["password"]}
    with ConnectHandler(**params) as conn:
        print(f"{row['name']:&lt;4} {row['device_type']:&lt;14} {conn.find_prompt()}")</pre>
<pre class="out">AUTO01$ python3 collect.py
R1   cisco_ios      PUN-CORE-R1#
J1   juniper_junos  netops@J1&gt;
N1   cisco_nxos     N1#</pre>
<p>Inventory file mein <b>path</b> hai, password nahi: <code>R1,10.99.0.1,cisco_ios,net/r1</code>. N1 ka password R1 aur J1 se alag hai, aur script ko iska pata nahi. Har device ka alag secret muft mein mil jaata hai.</p>

<h3>.env se passwords hatao</h3>
<p>Sabit karo ki script ko ab unki zaroorat nahi: secrets wali teen lines delete karo, file dekho aur collector dobara chalao.</p>
<pre class="code">sed -i '/^NET_/d;/^NXOS_/d' .env</pre>
<pre class="out">AUTO01$ cat .env
VAULT_ADDR=h&#116;tp://10.99.0.70:8200</pre>
<pre class="out">AUTO01$ python3 collect.py
R1   cisco_ios      PUN-CORE-R1#
J1   juniper_junos  netops@J1&gt;
N1   cisco_nxos     N1#</pre>
<p>Sirf server ka address bacha hai. Purane passwords tumhari shell history, backups aur file ki purani copies mein ab bhi hain; ab jab kuch unpar nirbhar nahi, unhe ek baar rotate karo.</p>

<h3>Kaam khatam hote hi token end karo</h3>
<p>15 minute ka token chhota hai, par 3 second mein khatam hone wali script use abhi end kar sakti hai. <code>collect.py</code> ke end mein do lines jodo:</p>
<pre class="code">client.auth.token.revoke_self()                 <span class="c"># the token has done its job: end it now</span>
print("token revoked, still valid:", client.is_authenticated())</pre>
<pre class="out">AUTO01$ python3 collect.py
R1   cisco_ios      PUN-CORE-R1#
J1   juniper_junos  netops@J1&gt;
N1   cisco_nxos     N1#
<span class="hl">token revoked, still valid: False</span></pre>
<p><code>revoke_self()</code> ke baad <code>is_authenticated()</code> <code>False</code> hai, aur log ya memory mein us token ki copy bekaar hai.</p>

<h3>Production version</h3>
<p>Asli jobs fail hote hain, aur fail hote job ko bhi apna token end karna chahiye aur chhoti baat kehni chahiye. Yeh version kaam ko <code>try</code> aur <code>finally</code> mein lapetta hai aur Vault mana kare to exit code 1 se nikalta hai. Doosra run aisi inventory use karta hai jisme ek path ka secret nahi hai.</p>
<pre class="code">"""collect_safe.py - the same collector; it always ends its token and fails with a short message."""
import csv
import sys

from hvac.exceptions import VaultError
from netmiko import ConnectHandler
from vault_creds import vault_client, get_creds

inventory = sys.argv[1] if len(sys.argv) &gt; 1 else "inventory.csv"
try:
    client = vault_client()
except VaultError as err:
    sys.exit(f"vault login failed: {type(err).__name__}")

try:
    with open(inventory) as f:
        for row in csv.DictReader(f):
            creds = get_creds(client, row["vault_path"])
            params = {"device_type": row["device_type"], "host": row["host"],
                      "username": creds["user"], "password": creds["password"], "secret": creds["password"]}
            with ConnectHandler(**params) as conn:
                print(f"{row['name']:&lt;4} {row['device_type']:&lt;14} {conn.find_prompt()}")
except (VaultError, LookupError) as err:
    sys.exit(f"vault read failed: {err}")
finally:
    client.auth.token.revoke_self()</pre>
<pre class="out">AUTO01$ python3 collect_safe.py
R1   cisco_ios      PUN-CORE-R1#
J1   juniper_junos  netops@J1&gt;
N1   cisco_nxos     N1#
AUTO01$ python3 collect_safe.py bad.csv; echo "exit code: $?"
R1   cisco_ios      PUN-CORE-R1#
vault read failed: no secret at secret/net/zzz
exit code: 1</pre>
<p>Yaad rakhne ke niyam:</p>
<ul><li>Secrets main thread mein fetch karo aur worker threads ko saade dictionaries do; jin threads par tumhara control nahi unke beech ek login share mat karo.</li><li>Fail closed: Vault down ho to ruk jao. File mein bache password par kabhi fall back mat karo.</li><li>Password local variable mein rakho; use log, print ya exception message mein mat daalo (redaction ke liye <code>py-secrets</code> dekho).</li><li>Har kism ke job ke liye ek role; collector ka token likh nahi sakta.</li></ul>

<div class="warn"><p><b>Aam galti.</b> "Ek request bachane ke liye" password ko global ya file mein cache karna. Tum copy-everywhere problem dobara bana lete ho. Login aur read ke milliseconds lagte hain; har run par karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Vault script ko token deta hai, Vault account ka password nahi. Device ka password padhna aur device mein login karna do alag steps hain, do alag credentials ke saath.</p></div>

<div class="scn"><h4>Ek script, teen passwords, zero files</h4><p>NOC collector roz raat 60 devices par chalta tha aur teen alag passwords chahiye the. Purani <code>.env</code> do jump hosts aur ek laptop par copy thi. Move ke baad file mein sirf Vault address tha, AppRole files us ek host par thi jahan job chalta hai, aur password badalne par NOC ne Vault mein ek naya version likha aur agla run utha liya. Laptop ka koi matlab nahi raha.</p><p><b>Seekh:</b> Copy ke liye sabse achhi jagah kahin nahi hai.</p></div>

<div class="iv"><p class="q">"netmiko ko Vault se credentials kaise dete ho?"</p><p>Ek helper AppRole se Vault mein login karta hai, device ke path se secret padhta hai, aur user aur password dictionary mein wapas deta hai. Script usse netmiko ka dictionary banati hai, connect karti hai, aur variable chhod deti hai. Token end mein, finally block mein, revoke hota hai, aur Vault error run ko rok deta hai, stored password par fall back nahi karta.</p></div>

<div class="kt"><p><b>Mukhya baatein</b></p><ul><li>Saara Vault code ek helper mein rakho: login, read, dost jaise errors.</li><li>Inventory secret <b>paths</b> list karti hai; passwords sirf Vault mein aur local variables mein rehte hain.</li><li>Move ke baad <code>.env</code> mein sirf address bachta hai; purane passwords ek baar rotate karo.</li><li><code>finally</code> block mein <code>revoke_self()</code> job fail hone par bhi token end karta hai.</li><li>Fail closed, secret kabhi print mat karo, main thread mein fetch karo.</li></ul></div>
`}};export{e as default};