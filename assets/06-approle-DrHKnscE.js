var e={id:`approle`,h:{en:`AppRole: a login for scripts`,hi:`AppRole: scripts ke liye login`},body:{en:`
<p>A person can type a password. A cron job at 02:00 cannot. If you give the job a username and password, you have only moved the old problem: a password in a file. Vault's answer for programs is <b>AppRole</b>, a login made of two halves that are handed over by two different routes. In this chapter you build it and meet the one hard question of secrets management: how does the very first secret arrive?</p>

<h3>An analogy: a badge number and a PIN</h3>
<p>Your employee badge has a number printed on it, and you know a PIN. The number alone opens nothing, and the PIN alone opens nothing. The guard checks both, then issues a day pass. AppRole works the same way: <code>role_id</code> is the badge number, <code>secret_id</code> is the PIN, and the day pass is the Vault token.</p>
<table class="cmp"><tr><th></th><th>role_id</th><th>secret_id</th></tr><tr><td>Like a</td><td>user name</td><td>password</td></tr><tr><td>Identifies</td><td>the role (policies, TTLs)</td><td>one issued credential for that role</td></tr><tr><td>Secret?</td><td>Not very; it can sit in a config file</td><td>Yes; short life, handed over separately</td></tr><tr><td>Made by</td><td>Vault, once per role</td><td>An admin or a deploy pipeline, many times</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="The admin makes the role, hands role_id and secret_id to the application, which logs in and receives a token">
<rect x="20" y="20" width="130" height="40" rx="8" fill="#ddd6fe"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="13">Admin / pipeline</text>
<rect x="255" y="20" width="130" height="40" rx="8" fill="#fde68a"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Vault</text>
<rect x="490" y="20" width="130" height="40" rx="8" fill="#bae6fd"/><text x="555" y="45" text-anchor="middle" class="svg-ink" font-size="13">Script</text>
<line x1="85" y1="60" x2="85" y2="235" stroke="#94a3b8" stroke-dasharray="4 4"/><line x1="320" y1="60" x2="320" y2="235" stroke="#94a3b8" stroke-dasharray="4 4"/><line x1="555" y1="60" x2="555" y2="235" stroke="#94a3b8" stroke-dasharray="4 4"/>
<line x1="85" y1="85" x2="320" y2="85" stroke="#64748b" stroke-width="2"/><text x="202" y="79" text-anchor="middle" class="svg-muted" font-size="12">1 create role + policy</text>
<line x1="85" y1="125" x2="555" y2="125" stroke="#64748b" stroke-width="2"/><text x="320" y="119" text-anchor="middle" class="svg-muted" font-size="12">2 hand over role_id and secret_id (two routes)</text>
<line x1="555" y1="160" x2="320" y2="160" stroke="#64748b" stroke-width="2"/><text x="437" y="154" text-anchor="middle" class="svg-muted" font-size="12">3 login with both</text>
<line x1="320" y1="190" x2="555" y2="190" stroke="#64748b" stroke-width="2"/><text x="437" y="184" text-anchor="middle" class="svg-muted" font-size="12">4 token (policies, ttl)</text>
<line x1="555" y1="220" x2="320" y2="220" stroke="#64748b" stroke-width="2"/><text x="437" y="214" text-anchor="middle" class="svg-muted" font-size="12">5 read secrets with the token</text>
</svg><p class="cap">The admin creates the role once and delivers its two halves. The script logs in at every run and works with a short-lived token.</p></div>

<h3>Set it up with hvac</h3>
<p>The policy from the last chapter exists. Now the admin job <code>provision.py</code> enables the method, creates the role with <code>net-read</code>, a 15 minute token and a 24 hour <code>secret_id</code>, reads the <code>role_id</code>, generates one <code>secret_id</code> and saves both in <code>~/vault-creds</code>.</p>
<pre class="code">"""provision.py - one-time admin job: an AppRole for the automation scripts."""
import os

import hvac

client = hvac.Client()          <span class="c"># VAULT_ADDR and VAULT_TOKEN come from the shell</span>
if "approle/" not in client.sys.list_auth_methods()["data"]:
    client.sys.enable_auth_method(method_type="approle")
client.auth.approle.create_or_update_approle(
    "netauto", token_policies=["net-read"], token_ttl="15m", token_max_ttl="1h", secret_id_ttl="24h")
role_id = client.auth.approle.read_role_id("netauto")["data"]["role_id"]
secret_id = client.auth.approle.generate_secret_id("netauto")["data"]["secret_id"]

folder = os.path.expanduser("~/vault-creds")
os.makedirs(folder, exist_ok=True)
os.chmod(folder, 0o700)
for name, value in (("role_id", role_id), ("secret_id", secret_id)):
    path = os.path.join(folder, name)
    with open(path, "w") as f:
        f.write(value)
    os.chmod(path, 0o600)
    print(f"wrote {path} (mode 600)")</pre>
<pre class="out">AUTO01$ python3 provision.py
wrote /home/netadmin/vault-creds/role_id (mode 600)
wrote /home/netadmin/vault-creds/secret_id (mode 600)</pre>
<pre class="out">AUTO01$ ls -l vault-creds
total 8
<span class="hl">-rw-------</span>  1 netadmin netadmin     36 Sep 29 09:00 role_id
<span class="hl">-rw-------</span>  1 netadmin netadmin     36 Sep 29 09:00 secret_id</pre>
<p>The script prints where it wrote the files, never what is in them. The folder is mode 700 and the files mode 600: only the service account can read them. It sets the modes with <code>os.chmod</code> after creating them, because a mode given to <code>os.makedirs</code> is cut down by the umask on a real host (and ignored in the lab).</p>
<p>Ask Vault what it stored. This is the answer to "which policies, and how long do tokens and secret_ids live?":</p>
<pre class="out">AUTO01$ vault read auth/approle/role/netauto
Key                        Value
---                        -----
bind_secret_id             true
local_secret_ids           false
policies                   [net-read]
secret_id_bound_cidrs      &lt;nil&gt;
secret_id_num_uses         0
<span class="hl">secret_id_ttl              86400</span>
token_bound_cidrs          []
token_explicit_max_ttl     0
<span class="hl">token_max_ttl              3600</span>
token_no_default_policy    false
token_num_uses             0
token_period               0
<span class="hl">token_policies             [net-read]</span>
<span class="hl">token_ttl                  900</span>
token_type                 default</pre>
<pre class="out">AUTO01$ vault auth list
Path        Type       Accessor                 Description
----        ----       --------                 -----------
<span class="hl">approle/    approle</span>    auth_approle_3ad6e842    
token/      token      auth_token_2a70452c      token based credentials</pre>
<p>Times are in seconds: a token lives 900 s (15 minutes) and can be renewed up to 3600 s; a <code>secret_id</code> is valid for 86 400 s (24 hours).</p>

<h3>How does the first secret arrive?</h3>
<p>This is the "secret zero" problem: the script needs a <code>secret_id</code> to get its secrets, so the <code>secret_id</code> has to be delivered somehow. There is no magic answer, only ways to make a theft less useful:</p>
<ul><li><b>Short life.</b> A <code>secret_id</code> that expires in 24 hours (or after one use) is worth little to a thief. Your pipeline makes a fresh one at each deploy.</li><li><b>Separate routes.</b> The <code>role_id</code> goes into the config of the job; the <code>secret_id</code> comes from the CI system's secret store or a file written by the deploy. Whoever sees one half learns nothing.</li><li><b>Tight file permissions.</b> Folder 700, files 600, owned by the account that runs the job (see <code>py-secrets</code>). Never in Git.</li><li><b>Narrow policy.</b> Even a valid login only reads device secrets.</li></ul>
<p>Real Vault offers more: response wrapping (the <code>secret_id</code> travels inside a one-use envelope), a limit on how often a <code>secret_id</code> can be used, and a limit on the networks it may log in from. The lab does not simulate response wrapping; use it where your Vault supports it.</p>

<h3>A failed login</h3>
<p>Vault gives the same answer whether the <code>role_id</code> or the <code>secret_id</code> is wrong, so an attacker learns nothing from the message.</p>
<pre class="code">import hvac
from hvac.exceptions import InvalidRequest

client = hvac.Client(token="")                 <span class="c"># no token yet: the login must produce one</span>
role_id = open("vault-creds/role_id").read().strip()
try:
    client.auth.approle.login(role_id=role_id, secret_id="not-the-secret-id")
except InvalidRequest as err:
    print("InvalidRequest:", err)
print("token after failed login:", repr(client.token))</pre>
<pre class="out">AUTO01$ python3 approle_bad.py
<span class="hl">InvalidRequest: invalid role or secret ID</span>, on post h&#116;tp://10.99.0.70:8200/v1/auth/approle/login
token after failed login: ''</pre>
<p>A failed login raises <code>InvalidRequest</code> (H&#84;TP 400), not <code>Forbidden</code>, and the client holds no token afterwards. A good login stores the new token inside the client, so every later call uses it. That is what the helper in the next chapter does.</p>

<div class="warn"><p><b>Common mistake.</b> Putting <code>role_id</code> and <code>secret_id</code> into the script as constants "because AppRole is safe". Then the script is the secret again. Keep both in files or variables outside Git, and let the script read them.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab folder is <code>~/vault-creds</code> because Python in the lab cannot open files in hidden folders; on a real host use a folder such as <code>/etc/netauto</code> owned by the service account. <code>os.makedirs(mode=0o700)</code> is ignored in the lab, so the script calls <code>os.chmod</code>, which is also what you should do on real systems.</p></div>

<div class="scn"><h4>The secret_id in the repository</h4><p>A team committed <code>secret_id</code> to a private Git repository "temporarily". Months later a contractor cloned it onto a laptop. Because the <code>secret_id</code> had a 24 hour life and the role could only read, the old value in the history was already dead and the damage was a policy review, not a rotation of 200 passwords. The team moved the value to the CI secret store the same week.</p><p><b>Lesson:</b> Short-lived, narrow credentials turn a leak into an inconvenience.</p></div>

<div class="iv"><p class="q">"What are role_id and secret_id, and why two?"</p><p>AppRole is Vault's login for machines. The role_id names the role and its policies and is not very secret; the secret_id is the credential and is short-lived. Splitting them lets me deliver the two through different routes, so stealing one is not enough. The script logs in with both and gets a token, which carries the policies and a TTL.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>AppRole is a machine login: <code>role_id</code> (like a user name) plus <code>secret_id</code> (like a password).</li><li>The role defines policies and TTLs; the login returns a token that follows them.</li><li>Deliver the two halves by different routes, give the <code>secret_id</code> a short life and keep files at 700 and 600.</li><li>A wrong role_id or secret_id gives the same <code>InvalidRequest</code>, by design.</li><li>Provisioning is an admin job; the daily script only logs in and reads.</li></ul></div>
`,hi:`
<p>Insaan password type kar sakta hai. 02:00 baje ka cron job nahi kar sakta. Job ko username aur password de do to tumne purani problem sirf khiska di: file mein password. Programs ke liye Vault ka jawab <b>AppRole</b> hai, do hisson ka login jo do alag raston se diye jaate hain. Is chapter mein tum use banate ho aur secrets management ka ek kathin sawaal samajhte ho: bilkul pehla secret kaise pahunchta hai?</p>

<h3>Ek analogy: badge number aur PIN</h3>
<p>Tumhare employee badge par ek number chhapa hai, aur tumhe ek PIN pata hai. Akela number kuch nahi kholta, akela PIN kuch nahi kholta. Guard dono check karta hai, phir day pass deta hai. AppRole aise hi chalta hai: <code>role_id</code> badge number hai, <code>secret_id</code> PIN hai, aur day pass Vault token hai.</p>
<table class="cmp"><tr><th></th><th>role_id</th><th>secret_id</th></tr><tr><td>Jaisa</td><td>user name</td><td>password</td></tr><tr><td>Kisko pehchanta hai</td><td>role ko (policies, TTLs)</td><td>us role ke liye jaari ek credential ko</td></tr><tr><td>Secret hai?</td><td>Zyada nahi; config file mein rakh sakte ho</td><td>Haan; chhoti life, alag se diya jaata hai</td></tr><tr><td>Kaun banata hai</td><td>Vault, har role ke liye ek baar</td><td>Admin ya deploy pipeline, kai baar</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Admin role banata hai, role_id aur secret_id application ko deta hai, jo login karke token paati hai">
<rect x="20" y="20" width="130" height="40" rx="8" fill="#ddd6fe"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="13">Admin / pipeline</text>
<rect x="255" y="20" width="130" height="40" rx="8" fill="#fde68a"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Vault</text>
<rect x="490" y="20" width="130" height="40" rx="8" fill="#bae6fd"/><text x="555" y="45" text-anchor="middle" class="svg-ink" font-size="13">Script</text>
<line x1="85" y1="60" x2="85" y2="235" stroke="#94a3b8" stroke-dasharray="4 4"/><line x1="320" y1="60" x2="320" y2="235" stroke="#94a3b8" stroke-dasharray="4 4"/><line x1="555" y1="60" x2="555" y2="235" stroke="#94a3b8" stroke-dasharray="4 4"/>
<line x1="85" y1="85" x2="320" y2="85" stroke="#64748b" stroke-width="2"/><text x="202" y="79" text-anchor="middle" class="svg-muted" font-size="12">1 role + policy banao</text>
<line x1="85" y1="125" x2="555" y2="125" stroke="#64748b" stroke-width="2"/><text x="320" y="119" text-anchor="middle" class="svg-muted" font-size="12">2 role_id aur secret_id do (do raste)</text>
<line x1="555" y1="160" x2="320" y2="160" stroke="#64748b" stroke-width="2"/><text x="437" y="154" text-anchor="middle" class="svg-muted" font-size="12">3 dono se login</text>
<line x1="320" y1="190" x2="555" y2="190" stroke="#64748b" stroke-width="2"/><text x="437" y="184" text-anchor="middle" class="svg-muted" font-size="12">4 token (policies, ttl)</text>
<line x1="555" y1="220" x2="320" y2="220" stroke="#64748b" stroke-width="2"/><text x="437" y="214" text-anchor="middle" class="svg-muted" font-size="12">5 token se secrets padho</text>
</svg><p class="cap">Admin role ek baar banata hai aur uske dono hisse deta hai. Script har run par login karti hai aur chhote token se kaam karti hai.</p></div>

<h3>hvac se set up karo</h3>
<p>Pichhle chapter ki policy maujood hai. Ab admin job <code>provision.py</code> method enable karti hai, role <code>net-read</code> ke saath banati hai, 15 minute ka token aur 24 ghante ka <code>secret_id</code> deti hai, <code>role_id</code> padhti hai, ek <code>secret_id</code> generate karti hai aur dono ko <code>~/vault-creds</code> mein save karti hai.</p>
<pre class="code">"""provision.py - one-time admin job: an AppRole for the automation scripts."""
import os

import hvac

client = hvac.Client()          <span class="c"># VAULT_ADDR and VAULT_TOKEN come from the shell</span>
if "approle/" not in client.sys.list_auth_methods()["data"]:
    client.sys.enable_auth_method(method_type="approle")
client.auth.approle.create_or_update_approle(
    "netauto", token_policies=["net-read"], token_ttl="15m", token_max_ttl="1h", secret_id_ttl="24h")
role_id = client.auth.approle.read_role_id("netauto")["data"]["role_id"]
secret_id = client.auth.approle.generate_secret_id("netauto")["data"]["secret_id"]

folder = os.path.expanduser("~/vault-creds")
os.makedirs(folder, exist_ok=True)
os.chmod(folder, 0o700)
for name, value in (("role_id", role_id), ("secret_id", secret_id)):
    path = os.path.join(folder, name)
    with open(path, "w") as f:
        f.write(value)
    os.chmod(path, 0o600)
    print(f"wrote {path} (mode 600)")</pre>
<pre class="out">AUTO01$ python3 provision.py
wrote /home/netadmin/vault-creds/role_id (mode 600)
wrote /home/netadmin/vault-creds/secret_id (mode 600)</pre>
<pre class="out">AUTO01$ ls -l vault-creds
total 8
<span class="hl">-rw-------</span>  1 netadmin netadmin     36 Sep 29 09:00 role_id
<span class="hl">-rw-------</span>  1 netadmin netadmin     36 Sep 29 09:00 secret_id</pre>
<p>Script batati hai ki files kahan likhi, ye nahi ki unmein kya hai. Folder mode 700 hai aur files mode 600: sirf service account unhe padh sakta hai. Modes woh files banane ke baad <code>os.chmod</code> se set karti hai, kyunki <code>os.makedirs</code> ko diya mode asli host par umask se kat jaata hai (aur lab mein ignore hota hai).</p>
<p>Vault se poochho usne kya store kiya. Yeh "kaunsi policies, aur token aur secret_id kitna jeete hain?" ka jawab hai:</p>
<pre class="out">AUTO01$ vault read auth/approle/role/netauto
Key                        Value
---                        -----
bind_secret_id             true
local_secret_ids           false
policies                   [net-read]
secret_id_bound_cidrs      &lt;nil&gt;
secret_id_num_uses         0
<span class="hl">secret_id_ttl              86400</span>
token_bound_cidrs          []
token_explicit_max_ttl     0
<span class="hl">token_max_ttl              3600</span>
token_no_default_policy    false
token_num_uses             0
token_period               0
<span class="hl">token_policies             [net-read]</span>
<span class="hl">token_ttl                  900</span>
token_type                 default</pre>
<pre class="out">AUTO01$ vault auth list
Path        Type       Accessor                 Description
----        ----       --------                 -----------
<span class="hl">approle/    approle</span>    auth_approle_3ad6e842    
token/      token      auth_token_2a70452c      token based credentials</pre>
<p>Time seconds mein hai: token 900 s (15 minute) jeeta hai aur 3600 s tak renew ho sakta hai; <code>secret_id</code> 86 400 s (24 ghante) ke liye valid hai.</p>

<h3>Pehla secret kaise pahunchta hai?</h3>
<p>Isse "secret zero" problem kehte hain: script ko apne secrets lene ke liye <code>secret_id</code> chahiye, to <code>secret_id</code> kisi tarah deliver karna hi padega. Koi jaadui jawab nahi, sirf chori ko kam kaam ka banane ke tareeke hain:</p>
<ul><li><b>Chhoti life.</b> 24 ghante mein (ya ek use ke baad) expire hone wala <code>secret_id</code> chor ke liye kam kaam ka hai. Tumhari pipeline har deploy par naya banati hai.</li><li><b>Alag raste.</b> <code>role_id</code> job ke config mein jaata hai; <code>secret_id</code> CI system ke secret store se ya deploy ki likhi file se aata hai. Ek hissa dekhne wale ko kuch pata nahi chalta.</li><li><b>Tight file permissions.</b> Folder 700, files 600, usi account ke naam par jo job chalata hai (<code>py-secrets</code> dekho). Git mein kabhi nahi.</li><li><b>Sankari policy.</b> Valid login bhi sirf device secrets padhta hai.</li></ul>
<p>Asli Vault mein aur bhi hai: response wrapping (<code>secret_id</code> ek one-use envelope mein jaata hai), <code>secret_id</code> kitni baar use ho uski limit, aur kin networks se login ho sakta hai uski limit. Lab response wrapping simulate nahi karti; jahan tumhara Vault support kare wahan use karo.</p>

<h3>Failed login</h3>
<p><code>role_id</code> galat ho ya <code>secret_id</code>, Vault ek hi jawab deta hai, isliye attacker ko message se kuch pata nahi chalta.</p>
<pre class="code">import hvac
from hvac.exceptions import InvalidRequest

client = hvac.Client(token="")                 <span class="c"># no token yet: the login must produce one</span>
role_id = open("vault-creds/role_id").read().strip()
try:
    client.auth.approle.login(role_id=role_id, secret_id="not-the-secret-id")
except InvalidRequest as err:
    print("InvalidRequest:", err)
print("token after failed login:", repr(client.token))</pre>
<pre class="out">AUTO01$ python3 approle_bad.py
<span class="hl">InvalidRequest: invalid role or secret ID</span>, on post h&#116;tp://10.99.0.70:8200/v1/auth/approle/login
token after failed login: ''</pre>
<p>Failed login <code>Forbidden</code> nahi, <code>InvalidRequest</code> (H&#84;TP 400) raise karta hai, aur uske baad client ke paas token nahi hota. Achha login naya token client ke andar store kar leta hai, isliye har agli call use use karti hai. Agle chapter ka helper yahi karta hai.</p>

<div class="warn"><p><b>Aam galti.</b> <code>role_id</code> aur <code>secret_id</code> ko script mein constants ki tarah likhna "kyunki AppRole safe hai". Tab script hi dobara secret ban jaati hai. Dono ko Git ke bahar files ya variables mein rakho aur script ko unhe padhne do.</p></div>
<div class="note"><p><b>Lab mein aur asli gear par.</b> Lab ka folder <code>~/vault-creds</code> hai kyunki lab ka Python hidden folders ki files nahi khol sakta; asli host par <code>/etc/netauto</code> jaisa folder rakho jo service account ka ho. <code>os.makedirs(mode=0o700)</code> lab mein ignore hota hai, isliye script <code>os.chmod</code> call karti hai, jo asli systems par bhi tumhe karna chahiye.</p></div>

<div class="scn"><h4>Repository mein secret_id</h4><p>Ek team ne "kuch der ke liye" <code>secret_id</code> private Git repository mein commit kar diya. Mahino baad ek contractor ne use laptop par clone kiya. <code>secret_id</code> ki life 24 ghante thi aur role sirf padh sakta tha, isliye history ki purani value pehle hi mar chuki thi aur nuksan policy review tha, 200 passwords ka rotation nahi. Team ne usi hafte value CI secret store mein daal di.</p><p><b>Seekh:</b> Chhoti life aur sankari credentials leak ko takleef bana dete hain, tabahi nahi.</p></div>

<div class="iv"><p class="q">"role_id aur secret_id kya hain, aur do kyun?"</p><p>AppRole machines ke liye Vault ka login hai. role_id role aur uski policies ka naam hai aur zyada secret nahi; secret_id credential hai aur chhoti life ka hai. Dono ko alag karne se main do alag raston se deliver kar sakta hoon, to ek chura lena kaafi nahi. Script dono se login karke token paati hai, jisme policies aur TTL hota hai.</p></div>

<div class="kt"><p><b>Mukhya baatein</b></p><ul><li>AppRole machine login hai: <code>role_id</code> (user name jaisa) aur <code>secret_id</code> (password jaisa).</li><li>Role policies aur TTLs tay karta hai; login us par chalne wala token deta hai.</li><li>Dono hisse alag raston se do, <code>secret_id</code> ki life chhoti rakho aur files 700 aur 600 par rakho.</li><li>Galat role_id ya secret_id ek hi <code>InvalidRequest</code> deta hai, jaan-boojh kar.</li><li>Provisioning admin ka kaam hai; roz ki script sirf login karti hai aur padhti hai.</li></ul></div>
`}};export{e as default};