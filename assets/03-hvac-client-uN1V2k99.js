var e={id:`hvac-client`,h:{en:`hvac: the Python client, errors and migrate.py`,hi:`hvac: Python client, errors aur migrate.py`},body:{en:`
<p>The command line is for you. Scripts use <code>hvac</code>, the Python client for Vault. It has the same capabilities, and almost every call is a direct translation of a command you already typed. In this chapter you read and write secrets from Python, learn the exceptions you will see and write the first lab script, <code>migrate.py</code>.</p>

<h3>An analogy: the same counter, a different door</h3>
<p>The <code>vault</code> command is the person walking up to the counter. <code>hvac</code> is a programme sending the same slip through the post slot. The clerk, the rules and the safe are the same; only the way of asking changes.</p>

<h3>Connect, then write and read</h3>
<p><code>hvac.Client()</code> without arguments does what the command does: it takes the address from <code>VAULT_ADDR</code> and the token from <code>VAULT_TOKEN</code>. Nothing secret appears in the file.</p>
<pre class="code">import hvac

client = hvac.Client()                 <span class="c"># VAULT_ADDR and VAULT_TOKEN come from the shell</span>
print("authenticated:", client.is_authenticated())

reply = client.secrets.kv.v2.create_or_update_secret(
    path="net/hv", secret={"user": "netops", "password": "demo-only-123"})
print("written, version", reply["data"]["version"])

read = client.secrets.kv.v2.read_secret_version(path="net/hv")
print("top-level keys:", sorted(read["data"]))
print("secret keys:", sorted(read["data"]["data"]))
print("version:", read["data"]["metadata"]["version"])
print("user:", read["data"]["data"]["user"])

print("names under net:", client.secrets.kv.v2.list_secrets(path="net")["data"]["keys"])</pre>
<pre class="out">AUTO01$ python3 hvac1.py
<span class="hl">authenticated: True</span>
<span class="hl">written, version 1</span>
<span class="hl">top-level keys: ['data', 'metadata']</span>
secret keys: ['password', 'user']
version: 1
user: netops
names under net: ['demo', 'demo2', 'hv']</pre>
<p>Look at the shape of a read. Vault wraps the answer in an envelope, so there are two layers called <code>data</code>: the outer one is Vault's envelope and the inner one is your secret. Next to it sits <code>metadata</code> with the version and times.</p>
<table class="cmp"><tr><th>You want</th><th>Write this</th></tr><tr><td>The user name</td><td><code>reply["data"]["data"]["user"]</code></td></tr><tr><td>The version you got</td><td><code>reply["data"]["metadata"]["version"]</code></td></tr><tr><td>The names under a folder</td><td><code>client.secrets.kv.v2.list_secrets(path="net")["data"]["keys"]</code></td></tr></table>
<p>The mount point is a keyword argument that defaults to <code>"secret"</code>. If your KV engine lives elsewhere you must pass <code>mount_point="..."</code> every time, which is the cause of one of the four failures in the troubleshooting chapter.</p>

<h3>From command to call</h3>
<table class="cmp"><tr><th>Command</th><th>hvac call (on client.secrets.kv.v2)</th></tr><tr><td><code>vault kv put</code></td><td><code>create_or_update_secret(path, secret, cas=None)</code></td></tr><tr><td><code>vault kv get</code></td><td><code>read_secret_version(path, version=None)</code></td></tr><tr><td><code>vault kv list</code></td><td><code>list_secrets(path)</code></td></tr><tr><td><code>vault kv metadata get</code></td><td><code>read_secret_metadata(path)</code></td></tr><tr><td><code>vault kv delete</code></td><td><code>delete_latest_version_of_secret(path)</code></td></tr><tr><td><code>vault kv undelete</code></td><td><code>undelete_secret_versions(path, versions=[1])</code></td></tr><tr><td><code>vault kv destroy</code></td><td><code>destroy_secret_versions(path, versions=[1])</code></td></tr></table>

<h3>Errors: one parent, a few children</h3>
<p>Every Vault problem raises a subclass of <code>hvac.exceptions.VaultError</code>, so one <code>except VaultError</code> catches them all and a more exact <code>except</code> catches one kind. The text is the server's message, a comma and the request that failed.</p>
<pre class="code">import hvac
from hvac.exceptions import Forbidden, InvalidPath, VaultError

client = hvac.Client()
try:
    client.secrets.kv.v2.read_secret_version(path="net/nothing-here")
except InvalidPath as err:
    print("InvalidPath:", err)

stranger = hvac.Client(token="hvs.not-a-real-token")
print("stranger authenticated:", stranger.is_authenticated())
try:
    stranger.secrets.kv.v2.read_secret_version(path="net/hv")
except Forbidden as err:
    print("Forbidden:", err)

print(issubclass(Forbidden, VaultError), issubclass(InvalidPath, VaultError))</pre>
<pre class="out">AUTO01$ python3 hvac2.py
<span class="hl">InvalidPath: None</span>, on get h&#116;tp://10.99.0.70:8200/v1/secret/data/net/nothing-here
stranger <span class="hl">authenticated: False</span>
<span class="hl">Forbidden: permission denied</span>, on get h&#116;tp://10.99.0.70:8200/v1/secret/data/net/hv
True True</pre>
<table class="cmp"><tr><th>H&#84;TP</th><th>Exception</th><th>Usual cause</th></tr><tr><td>404</td><td><code>InvalidPath</code></td><td>No secret there, or its latest version is deleted</td></tr><tr><td>403</td><td><code>Forbidden</code></td><td>Token missing, expired or not allowed on this path</td></tr><tr><td>400</td><td><code>InvalidRequest</code></td><td>Bad input: wrong secret_id, check-and-set mismatch</td></tr><tr><td>503</td><td><code>VaultDown</code></td><td>Vault is sealed or not ready</td></tr></table>
<p>Notice two things. A missing secret prints <code>None</code> as its message, because Vault sends an empty error list for a plain 404. And <code>is_authenticated()</code> returns <code>False</code> for a bad token instead of raising, so it is a good first check in a script. When Vault is sealed, though, it does raise <code>VaultDown</code>.</p>

<h3>Lab script 1: migrate.py</h3>
<p>The first job in the configure lab is the migration of the three device passwords from <code>.env</code> into Vault. The script reads <code>.env</code> with <code>dotenv_values</code>, which gives you a dictionary without copying the values into the environment, and prints only the path and the version.</p>
<pre class="code">"""migrate.py - move the device passwords from .env into Vault (run once, by an administrator)."""
import hvac
from dotenv import dotenv_values

env = dotenv_values(".env")                      <span class="c"># read the file, do not copy it into os.environ</span>
client = hvac.Client()                           <span class="c"># VAULT_ADDR and VAULT_TOKEN come from the shell</span>
if not client.is_authenticated():
    raise SystemExit("VAULT_TOKEN is missing or not valid")

PASSWORD_VAR = {"r1": "NET_PASS", "j1": "NET_PASS", "n1": "NXOS_PASS"}
for name, var in PASSWORD_VAR.items():
    secret = {"user": env["NET_USER"], "password": env[var]}
    reply = client.secrets.kv.v2.create_or_update_secret(path=f"net/{name}", secret=secret)
    print(f"stored net/{name} as version {reply['data']['version']}")</pre>
<p>Run it twice, as an operator does after fixing a typo. The second run does not fail and does not overwrite: it adds version 2.</p>
<pre class="out">AUTO01$ python3 migrate.py
stored <span class="hl">net/r1 as version 1</span>
stored net/j1 as version 1
stored net/n1 as version 1
AUTO01$ python3 migrate.py
stored <span class="hl">net/r1 as version 2</span>
stored net/j1 as version 2
stored net/n1 as version 2</pre>

<div class="warn"><p><b>Common mistake.</b> Printing the secret to check it worked. The script above prints the path and the version, nothing else. If you need to confirm a value, print its length or compare it with <code>==</code> and print <code>True</code>. Output ends up in terminal scrollback, cron mail and CI logs.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab's <code>hvac</code> reports version 2.1.0 and its error text follows hvac 2.1 (<code>message, on get URL</code>). Vault itself runs without TLS here, so the address starts with the plain scheme; a real client uses an H&#84;TPS address and, if your CA is private, <code>verify</code> pointing at its certificate file. Never switch verification off to make an error go away.</p></div>

<div class="scn"><h4>The script that printed what it wrote</h4><p>A migration script printed <code>stored net/r1 password NK@2026</code> to confirm each write. It ran from a CI job, so the passwords landed in the build log for 90 days and in the chat bot that posts build results. All of them had to be rotated. The fixed script prints <code>stored net/r1 as version 1</code>.</p><p><b>Lesson:</b> Log the fact (path and version), never the value.</p></div>

<div class="iv"><p class="q">"How do you handle hvac errors in a script?"</p><p>I catch <code>VaultError</code> at the top level so the script ends with a clear message and a non-zero exit code, and I catch the exact classes where I can act: <code>InvalidPath</code> to say "no secret at that path", <code>Forbidden</code> to hint at policy or an expired token, <code>VaultDown</code> to alert that Vault is sealed. I never print the secret and I never fall back to a password stored in the script.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li><code>hvac.Client()</code> reads <code>VAULT_ADDR</code> and <code>VAULT_TOKEN</code> like the command does.</li><li>A read has two <code>data</code> layers: Vault's envelope and your secret; <code>metadata</code> holds the version.</li><li>Every error is a <code>VaultError</code>; 404 is <code>InvalidPath</code>, 403 <code>Forbidden</code>, 400 <code>InvalidRequest</code>, 503 <code>VaultDown</code>.</li><li><code>is_authenticated()</code> gives <code>False</code> for a bad token; it raises when Vault is sealed.</li><li>Print paths and versions, never values.</li></ul></div>
`,hi:`
<p>Command line tumhare liye hai. Scripts <code>hvac</code> use karti hain, jo Vault ka Python client hai. Isme wahi capabilities hain, aur lagbhag har call us command ka seedha anuvaad hai jo tum pehle type kar chuke ho. Is chapter mein tum Python se secrets padhte aur likhte ho, woh exceptions seekhte ho jo milengi, aur pehli lab script <code>migrate.py</code> likhte ho.</p>

<h3>Ek analogy: wahi counter, doosra darwaza</h3>
<p><code>vault</code> command counter par chalkar jaane wala insaan hai. <code>hvac</code> ek programme hai jo wahi parchi post slot se bhejta hai. Clerk, rules aur tijori wahi hain; sirf poochhne ka tareeka badalta hai.</p>

<h3>Connect karo, phir likho aur padho</h3>
<p>Bina arguments ke <code>hvac.Client()</code> wahi karta hai jo command karti hai: address <code>VAULT_ADDR</code> se aur token <code>VAULT_TOKEN</code> se leta hai. File mein kuch secret nahi dikhta.</p>
<pre class="code">import hvac

client = hvac.Client()                 <span class="c"># VAULT_ADDR and VAULT_TOKEN come from the shell</span>
print("authenticated:", client.is_authenticated())

reply = client.secrets.kv.v2.create_or_update_secret(
    path="net/hv", secret={"user": "netops", "password": "demo-only-123"})
print("written, version", reply["data"]["version"])

read = client.secrets.kv.v2.read_secret_version(path="net/hv")
print("top-level keys:", sorted(read["data"]))
print("secret keys:", sorted(read["data"]["data"]))
print("version:", read["data"]["metadata"]["version"])
print("user:", read["data"]["data"]["user"])

print("names under net:", client.secrets.kv.v2.list_secrets(path="net")["data"]["keys"])</pre>
<pre class="out">AUTO01$ python3 hvac1.py
<span class="hl">authenticated: True</span>
<span class="hl">written, version 1</span>
<span class="hl">top-level keys: ['data', 'metadata']</span>
secret keys: ['password', 'user']
version: 1
user: netops
names under net: ['demo', 'demo2', 'hv']</pre>
<p>Read ka shape dekho. Vault jawab ko envelope mein lapetta hai, isliye <code>data</code> naam ki do layers hoti hain: bahar wali Vault ka envelope hai aur andar wali tumhara secret. Uske paas <code>metadata</code> hai jisme version aur times hote hain.</p>
<table class="cmp"><tr><th>Tumhe chahiye</th><th>Yeh likho</th></tr><tr><td>User name</td><td><code>reply["data"]["data"]["user"]</code></td></tr><tr><td>Jo version mila</td><td><code>reply["data"]["metadata"]["version"]</code></td></tr><tr><td>Folder ke neeche ke names</td><td><code>client.secrets.kv.v2.list_secrets(path="net")["data"]["keys"]</code></td></tr></table>
<p>Mount point ek keyword argument hai jiska default <code>"secret"</code> hai. Agar tumhara KV engine kahin aur hai to har baar <code>mount_point="..."</code> dena padega, aur troubleshooting chapter ke chaar failures mein se ek ki wajah yahi hai.</p>

<h3>Command se call tak</h3>
<table class="cmp"><tr><th>Command</th><th>hvac call (client.secrets.kv.v2 par)</th></tr><tr><td><code>vault kv put</code></td><td><code>create_or_update_secret(path, secret, cas=None)</code></td></tr><tr><td><code>vault kv get</code></td><td><code>read_secret_version(path, version=None)</code></td></tr><tr><td><code>vault kv list</code></td><td><code>list_secrets(path)</code></td></tr><tr><td><code>vault kv metadata get</code></td><td><code>read_secret_metadata(path)</code></td></tr><tr><td><code>vault kv delete</code></td><td><code>delete_latest_version_of_secret(path)</code></td></tr><tr><td><code>vault kv undelete</code></td><td><code>undelete_secret_versions(path, versions=[1])</code></td></tr><tr><td><code>vault kv destroy</code></td><td><code>destroy_secret_versions(path, versions=[1])</code></td></tr></table>

<h3>Errors: ek parent, kuch bachche</h3>
<p>Vault ki har problem <code>hvac.exceptions.VaultError</code> ki subclass raise karti hai, isliye ek <code>except VaultError</code> sab pakadta hai aur ek zyada exact <code>except</code> sirf ek kism pakadta hai. Text server ka message hota hai, ek comma, aur woh request jo fail hui.</p>
<pre class="code">import hvac
from hvac.exceptions import Forbidden, InvalidPath, VaultError

client = hvac.Client()
try:
    client.secrets.kv.v2.read_secret_version(path="net/nothing-here")
except InvalidPath as err:
    print("InvalidPath:", err)

stranger = hvac.Client(token="hvs.not-a-real-token")
print("stranger authenticated:", stranger.is_authenticated())
try:
    stranger.secrets.kv.v2.read_secret_version(path="net/hv")
except Forbidden as err:
    print("Forbidden:", err)

print(issubclass(Forbidden, VaultError), issubclass(InvalidPath, VaultError))</pre>
<pre class="out">AUTO01$ python3 hvac2.py
<span class="hl">InvalidPath: None</span>, on get h&#116;tp://10.99.0.70:8200/v1/secret/data/net/nothing-here
stranger <span class="hl">authenticated: False</span>
<span class="hl">Forbidden: permission denied</span>, on get h&#116;tp://10.99.0.70:8200/v1/secret/data/net/hv
True True</pre>
<table class="cmp"><tr><th>H&#84;TP</th><th>Exception</th><th>Aam wajah</th></tr><tr><td>404</td><td><code>InvalidPath</code></td><td>Wahan koi secret nahi, ya uska latest version deleted hai</td></tr><tr><td>403</td><td><code>Forbidden</code></td><td>Token missing, expired ya is path par allowed nahi</td></tr><tr><td>400</td><td><code>InvalidRequest</code></td><td>Galat input: galat secret_id, check-and-set mismatch</td></tr><tr><td>503</td><td><code>VaultDown</code></td><td>Vault sealed hai ya ready nahi</td></tr></table>
<p>Do baatein dhyan do. Missing secret ka message <code>None</code> print hota hai, kyunki saadi 404 par Vault khaali error list bhejta hai. Aur <code>is_authenticated()</code> galat token par raise karne ke bajaye <code>False</code> deta hai, isliye script ka achha pehla check hai. Lekin Vault sealed ho to woh <code>VaultDown</code> raise karta hai.</p>

<h3>Lab script 1: migrate.py</h3>
<p>Configure lab ka pehla kaam teen device passwords ko <code>.env</code> se Vault mein le jaana hai. Script <code>.env</code> ko <code>dotenv_values</code> se padhti hai, jo values ko environment mein copy kiye bina dictionary deta hai, aur sirf path aur version print karti hai.</p>
<pre class="code">"""migrate.py - move the device passwords from .env into Vault (run once, by an administrator)."""
import hvac
from dotenv import dotenv_values

env = dotenv_values(".env")                      <span class="c"># read the file, do not copy it into os.environ</span>
client = hvac.Client()                           <span class="c"># VAULT_ADDR and VAULT_TOKEN come from the shell</span>
if not client.is_authenticated():
    raise SystemExit("VAULT_TOKEN is missing or not valid")

PASSWORD_VAR = {"r1": "NET_PASS", "j1": "NET_PASS", "n1": "NXOS_PASS"}
for name, var in PASSWORD_VAR.items():
    secret = {"user": env["NET_USER"], "password": env[var]}
    reply = client.secrets.kv.v2.create_or_update_secret(path=f"net/{name}", secret=secret)
    print(f"stored net/{name} as version {reply['data']['version']}")</pre>
<p>Ise do baar chalao, jaise operator typo theek karne ke baad chalata hai. Doosra run fail nahi hota aur overwrite bhi nahi karta: version 2 jodta hai.</p>
<pre class="out">AUTO01$ python3 migrate.py
stored <span class="hl">net/r1 as version 1</span>
stored net/j1 as version 1
stored net/n1 as version 1
AUTO01$ python3 migrate.py
stored <span class="hl">net/r1 as version 2</span>
stored net/j1 as version 2
stored net/n1 as version 2</pre>

<div class="warn"><p><b>Aam galti.</b> Kaam hua ya nahi dekhne ke liye secret print karna. Upar ki script path aur version print karti hai, aur kuch nahi. Value confirm karni ho to uski length print karo ya <code>==</code> se compare karke <code>True</code> print karo. Output terminal scrollback, cron mail aur CI logs mein pahunch jaata hai.</p></div>
<div class="note"><p><b>Lab mein aur asli gear par.</b> Lab ka <code>hvac</code> version 2.1.0 batata hai aur uska error text hvac 2.1 jaisa hai (<code>message, on get URL</code>). Yahan Vault bina TLS ke chalta hai, isliye address plain scheme se shuru hota hai; asli client H&#84;TPS address use karta hai aur agar CA private ho to <code>verify</code> uski certificate file ko point karta hai. Error hatane ke liye verification kabhi band mat karo.</p></div>

<div class="scn"><h4>Jo script apna likha print kar deti thi</h4><p>Ek migration script har write confirm karne ke liye <code>stored net/r1 password NK@2026</code> print karti thi. Woh CI job se chalti thi, isliye passwords 90 din tak build log mein aur build results post karne wale chat bot mein pahunch gaye. Sab rotate karne pade. Theek ki gayi script <code>stored net/r1 as version 1</code> print karti hai.</p><p><b>Seekh:</b> Fact log karo (path aur version), value kabhi nahi.</p></div>

<div class="iv"><p class="q">"Script mein hvac errors kaise sambhalte ho?"</p><p>Top level par <code>VaultError</code> pakadta hoon taaki script saaf message aur non-zero exit code ke saath khatam ho, aur jahan kuch kar sakta hoon wahan exact classes: "us path par secret nahi" kehne ke liye <code>InvalidPath</code>, policy ya expired token ka ishaara dene ke liye <code>Forbidden</code>, "Vault sealed hai" alert ke liye <code>VaultDown</code>. Secret kabhi print nahi karta aur script mein rakhe password par fall back kabhi nahi karta.</p></div>

<div class="kt"><p><b>Mukhya baatein</b></p><ul><li><code>hvac.Client()</code> command ki tarah <code>VAULT_ADDR</code> aur <code>VAULT_TOKEN</code> padhta hai.</li><li>Read mein do <code>data</code> layers hoti hain: Vault ka envelope aur tumhara secret; <code>metadata</code> mein version hota hai.</li><li>Har error ek <code>VaultError</code> hai; 404 <code>InvalidPath</code>, 403 <code>Forbidden</code>, 400 <code>InvalidRequest</code>, 503 <code>VaultDown</code>.</li><li><code>is_authenticated()</code> galat token par <code>False</code> deta hai; Vault sealed ho to raise karta hai.</li><li>Paths aur versions print karo, values kabhi nahi.</li></ul></div>
`}};export{e as default};