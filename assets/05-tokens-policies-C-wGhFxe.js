var e={id:`tokens-policies`,h:{en:`Tokens, policies and least privilege`,hi:`Tokens, policies aur least privilege`},body:{en:`
<p>In chapter 2 you used a setup token that can do anything. Scripts must never hold such a token. This chapter explains what a token really is, how a policy limits it and how to write a policy that gives a script exactly the access it needs and nothing more. That rule has a name: <b>least privilege</b>.</p>

<h3>An analogy: the visitor badge</h3>
<p>A visitor badge has two limits. It expires at 17:00, and it opens only the doors printed on it. A Vault token is the same: a <b>lease</b> (it dies after its time to live) plus a list of <b>policies</b> (which doors it opens). The security desk can also take the badge back at any time.</p>

<h3>Tokens are leases</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="A token lives for its ttl, can be renewed, and ends at the maximum ttl">
<line x1="40" y1="100" x2="600" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="40" y="82" width="200" height="36" rx="6" fill="#bbf7d0"/><text x="140" y="105" text-anchor="middle" class="svg-ink" font-size="13">first ttl</text>
<rect x="240" y="82" width="200" height="36" rx="6" fill="#bbf7d0"/><text x="340" y="105" text-anchor="middle" class="svg-ink" font-size="13">renewed ttl</text>
<rect x="440" y="82" width="160" height="36" rx="6" fill="#fed7aa"/><text x="520" y="105" text-anchor="middle" class="svg-ink" font-size="13">last ttl</text>
<text x="40" y="70" class="svg-accent" font-size="12">issued</text><text x="240" y="70" text-anchor="middle" class="svg-accent" font-size="12">renew</text><text x="440" y="70" text-anchor="middle" class="svg-accent" font-size="12">renew</text><text x="600" y="70" text-anchor="end" class="svg-accent" font-size="12">max ttl: end</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Renewing pushes the end out, never past the maximum. Then the script must log in again.</text>
</svg><p class="cap">A token is a lease. Renewing extends it up to its maximum; after that only a new login helps.</p></div>
<p>Every token has a <code>ttl</code> (seconds left), a <code>renewable</code> flag and a list of policies. The setup token of the lab is special:</p>
<pre class="out">AUTO01$ vault token lookup
Key                 Value
---                 -----
accessor            PCSyKSBJoiMdqaJ8J63QtE28
creation_time       1791732426
creation_<span class="hl">ttl        0s</span>
display_name        root
entity_id           
expire_time         &lt;nil&gt;
explicit_max_ttl    0
id                  root-token-for-lab
issue_time          2026-10-11T15:27:06.173241743Z
meta                &lt;nil&gt;
num_uses            0
orphan              true
path                auth/token/root
<span class="hl">policies            [root]</span>
<span class="hl">renewable           false</span>
<span class="hl">ttl                 0s</span>
type                service</pre>
<p>Policy <code>root</code> allows everything and <code>ttl 0s</code> means it never expires. A root token is for the first hour of a Vault's life; after that it is revoked and people use their own logins. A token for a script should live minutes, not months.</p>
<p>From hvac the calls are on <code>client.auth.token</code>: <code>lookup_self()</code> asks "who am I and for how long", <code>renew_self()</code> extends the lease, <code>revoke_self()</code> ends it now, <code>create(policies=[...], ttl="10m")</code> makes a child token.</p>

<h3>Policies: paths and capabilities</h3>
<p>A policy is a short text in HCL. Each block names a path and the capabilities allowed on it. If no block matches, the answer is "permission denied". Policies add up when a token has several, and an explicit <code>deny</code> beats everything.</p>
<table class="cmp"><tr><th>Capability</th><th>Lets the token</th></tr><tr><td><code>read</code></td><td>Fetch the value at the path</td></tr><tr><td><code>list</code></td><td>List the names under the path</td></tr><tr><td><code>create</code>, <code>update</code></td><td>Write a new secret, or change one that exists</td></tr><tr><td><code>delete</code></td><td>Delete</td></tr><tr><td><code>patch</code></td><td>Change some fields of a secret</td></tr><tr><td><code>sudo</code></td><td>Reach root-protected paths</td></tr><tr><td><code>deny</code></td><td>Refuse, whatever other policies say</td></tr></table>
<p>Two wildcards exist: a <code>*</code> at the end matches everything below, and a <code>+</code> matches exactly one path segment. For KV version 2 remember chapter 2: values are under <code>data/</code>, names and versions under <code>metadata/</code>. This is the lab policy:</p>
<pre class="code"><span class="c"># read-only for the automation role: the device secrets, nothing else</span>
path "secret/data/net/*" {
  capabilities = ["read"]
}

<span class="c"># lets a script list which devices have a secret (names only)</span>
path "secret/metadata/net/*" {
  capabilities = ["list"]
}</pre>
<pre class="out">AUTO01$ vault policy write net-read net-read.hcl
Success! Uploaded policy: net-read</pre>
<p>The first block lets a script <b>read</b> secrets below <code>secret/data/net/</code> and nothing else. The second lets it <b>list</b> the names. No <code>create</code>, <code>update</code> or <code>delete</code> anywhere: a stolen token can read device passwords, but it cannot change or erase one.</p>

<h3>Proving the limits</h3>
<p>The script below makes a token with only this policy and a 10 minute life, then tries four things. Only the token's first attempt is allowed. The token itself is never printed.</p>
<pre class="code">import hvac
from hvac.exceptions import Forbidden

admin = hvac.Client()
made = admin.auth.token.create(policies=["net-read"], ttl="10m")
auth = made["auth"]
print("policies:", sorted(auth["policies"]), "| lease:", auth["lease_duration"], "s | renewable:", auth["renewable"])

limited = hvac.Client(token=auth["client_token"])         <span class="c"># the token itself is never printed</span>
info = limited.auth.token.lookup_self()["data"]
print("ttl left &lt;= 600:", info["ttl"] &lt;= 600)
print("read net/r1  :", limited.secrets.kv.v2.read_secret_version(path="net/r1")["data"]["data"]["user"])
for label, call in (
    ("write net/r1", lambda: limited.secrets.kv.v2.create_or_update_secret(path="net/r1", secret={"x": 1})),
    ("read net/other", lambda: limited.secrets.kv.v2.read_secret_version(path="other/x")),
    ("list policies", lambda: limited.sys.list_policies()),
):
    try:
        call()
    except Forbidden:
        print(f"{label:&lt;15}: Forbidden")
print("renewed lease:", limited.auth.token.renew_self()["auth"]["lease_duration"], "s")
limited.auth.token.revoke_self()
print("after revoke_self:", limited.is_authenticated())</pre>
<pre class="out">AUTO01$ python3 tokens.py
policies: ['default', 'net-read'] | lease: 600 s | renewable: True
ttl left &lt;= 600: True
read net/r1  : netops
<span class="hl">write net/r1   : Forbidden</span>
<span class="hl">read net/other : Forbidden</span>
<span class="hl">list policies  : Forbidden</span>
renewed lease: 600 s
<span class="hl">after revoke_self: False</span></pre>
<p>Even <code>list policies</code> is refused, because the policy API lives at <code>sys/policies</code>, a path this policy does not mention. The <code>default</code> policy that Vault adds to every token allows only things like looking up itself.</p>

<h3>Least privilege, in practice</h3>
<ul><li>One policy per job, named after the job (<code>net-read</code>, <code>net-rotate</code>), not after a person.</li><li>Read-only for collectors. A separate, rarely used role for the job that rotates passwords.</li><li>The narrowest path that works: <code>secret/data/net/*</code>, not <code>secret/*</code>.</li><li>Short TTLs and <code>revoke_self()</code> when the script is done.</li><li>Never put the setup token into a script, a cron file or a CI variable.</li></ul>

<div class="warn"><p><b>Common mistake.</b> Granting <code>list</code> on <code>secret/data/net/*</code> and wondering why names do not list. Listing is a metadata operation: the capability goes on <code>secret/metadata/net/*</code>.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab understands the policy language you need here (path blocks, capabilities, <code>*</code> and <code>+</code>). A syntax error produces Vault's "1 error occurred" wording. Sentinel rules and namespaces are not simulated. Tokens in the lab expire by the lab clock, and a token that was made on another day cannot be shown, which is why Lab 2 hands you a stale one.</p></div>

<div class="scn"><h4>One wildcard too many</h4><p>To "make it work", a team gave the collector the policy <code>path "secret/*" { capabilities = ["create","read","update","delete","list"] }</code>. A bug in a clean-up function then deleted every device secret, and nobody could tell from the policy that this was possible. The fix was two policies: read-only for collectors, and a narrow delete right for the clean-up job on its own path.</p><p><b>Lesson:</b> Write the policy for what the script does today, not for what it might do someday.</p></div>

<div class="iv"><p class="q">"What does least privilege mean in Vault?"</p><p>Each client gets a policy with only the paths and capabilities its job needs, and a token that lives only as long as the job. A collector gets read on the device secrets and nothing else; a rotation job gets update on exactly those paths; people sign in with their own identity. If one token leaks, the damage is limited and the token is easy to revoke.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>A token is a lease with policies attached; it expires, can be renewed up to a maximum and can be revoked.</li><li>No matching policy block means permission denied; deny always wins.</li><li>For KV version 2: <code>read</code> on <code>data/</code>, <code>list</code> on <code>metadata/</code>.</li><li>A script policy has no create, update or delete unless the script really writes.</li><li>Call <code>revoke_self()</code> when the work is done.</li></ul></div>
`,hi:`
<p>Chapter 2 mein tumne ek setup token use kiya jo kuch bhi kar sakta hai. Scripts ko aisa token kabhi nahi rakhna chahiye. Yeh chapter samjhata hai ki token asal mein kya hai, policy use kaise limit karti hai, aur aisi policy kaise likhte hain jo script ko theek utna access de jitna chahiye aur ek bit zyada nahi. Is niyam ka naam hai <b>least privilege</b>.</p>

<h3>Ek analogy: visitor badge</h3>
<p>Visitor badge ki do limits hoti hain. Woh 17:00 baje expire hota hai, aur sirf unhi darwazon ko kholta hai jo us par likhe hain. Vault token bhi waisa hi hai: ek <b>lease</b> (apne time to live ke baad mar jaata hai) aur <b>policies</b> ki list (kaunse darwaze kholta hai). Security desk badge kabhi bhi wapas le sakta hai.</p>

<h3>Tokens leases hain</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Token apne ttl tak jeeta hai, renew ho sakta hai, aur maximum ttl par khatam">
<line x1="40" y1="100" x2="600" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="40" y="82" width="200" height="36" rx="6" fill="#bbf7d0"/><text x="140" y="105" text-anchor="middle" class="svg-ink" font-size="13">pehla ttl</text>
<rect x="240" y="82" width="200" height="36" rx="6" fill="#bbf7d0"/><text x="340" y="105" text-anchor="middle" class="svg-ink" font-size="13">renew ke baad ttl</text>
<rect x="440" y="82" width="160" height="36" rx="6" fill="#fed7aa"/><text x="520" y="105" text-anchor="middle" class="svg-ink" font-size="13">aakhri ttl</text>
<text x="40" y="70" class="svg-accent" font-size="12">issued</text><text x="240" y="70" text-anchor="middle" class="svg-accent" font-size="12">renew</text><text x="440" y="70" text-anchor="middle" class="svg-accent" font-size="12">renew</text><text x="600" y="70" text-anchor="end" class="svg-accent" font-size="12">max ttl: end</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Renew karne se end aage khiskta hai, maximum ke paar kabhi nahi. Phir script ko dobara login karna padta hai.</text>
</svg><p class="cap">Token ek lease hai. Renew karne se woh maximum tak badhta hai; uske baad sirf naya login kaam aata hai.</p></div>
<p>Har token ka ek <code>ttl</code> (bache hue seconds), ek <code>renewable</code> flag aur policies ki list hoti hai. Lab ka setup token khaas hai:</p>
<pre class="out">AUTO01$ vault token lookup
Key                 Value
---                 -----
accessor            PCSyKSBJoiMdqaJ8J63QtE28
creation_time       1791732426
creation_<span class="hl">ttl        0s</span>
display_name        root
entity_id           
expire_time         &lt;nil&gt;
explicit_max_ttl    0
id                  root-token-for-lab
issue_time          2026-10-11T15:27:06.173241743Z
meta                &lt;nil&gt;
num_uses            0
orphan              true
path                auth/token/root
<span class="hl">policies            [root]</span>
<span class="hl">renewable           false</span>
<span class="hl">ttl                 0s</span>
type                service</pre>
<p>Policy <code>root</code> sab kuch allow karti hai aur <code>ttl 0s</code> ka matlab kabhi expire nahi hota. Root token Vault ke pehle ghante ke liye hai; uske baad revoke ho jaata hai aur log apne logins use karte hain. Script ka token minutes jeeta hai, mahine nahi.</p>
<p>hvac mein calls <code>client.auth.token</code> par hain: <code>lookup_self()</code> poochhta hai "main kaun hoon aur kitni der ke liye", <code>renew_self()</code> lease badhata hai, <code>revoke_self()</code> use abhi khatam karta hai, <code>create(policies=[...], ttl="10m")</code> child token banata hai.</p>

<h3>Policies: paths aur capabilities</h3>
<p>Policy HCL mein ek chhota text hai. Har block ek path aur us par allowed capabilities batata hai. Koi block match na kare to jawab "permission denied" hai. Ek token ki kai policies hon to woh jud jaati hain, aur explicit <code>deny</code> sab par bhaari hai.</p>
<table class="cmp"><tr><th>Capability</th><th>Token ko kya karne deti hai</th></tr><tr><td><code>read</code></td><td>Path ki value fetch karna</td></tr><tr><td><code>list</code></td><td>Path ke neeche ke names list karna</td></tr><tr><td><code>create</code>, <code>update</code></td><td>Naya secret likhna, ya maujood badalna</td></tr><tr><td><code>delete</code></td><td>Delete karna</td></tr><tr><td><code>patch</code></td><td>Secret ke kuch fields badalna</td></tr><tr><td><code>sudo</code></td><td>Root-protected paths tak pahunchna</td></tr><tr><td><code>deny</code></td><td>Mana karna, baaki policies kuch bhi kahein</td></tr></table>
<p>Do wildcards hain: end ka <code>*</code> neeche sab kuch match karta hai, aur <code>+</code> bilkul ek path segment match karta hai. KV version 2 ke liye chapter 2 yaad rakho: values <code>data/</code> ke neeche, names aur versions <code>metadata/</code> ke neeche. Yeh lab ki policy hai:</p>
<pre class="code"><span class="c"># read-only for the automation role: the device secrets, nothing else</span>
path "secret/data/net/*" {
  capabilities = ["read"]
}

<span class="c"># lets a script list which devices have a secret (names only)</span>
path "secret/metadata/net/*" {
  capabilities = ["list"]
}</pre>
<pre class="out">AUTO01$ vault policy write net-read net-read.hcl
Success! Uploaded policy: net-read</pre>
<p>Pehla block script ko <code>secret/data/net/</code> ke neeche ke secrets <b>padhne</b> deta hai aur kuch nahi. Doosra use names <b>list</b> karne deta hai. Kahin <code>create</code>, <code>update</code> ya <code>delete</code> nahi: chori hua token device passwords padh sakta hai, par kisi ko badal ya mita nahi sakta.</p>

<h3>Limits ko sabit karna</h3>
<p>Neeche ki script sirf is policy aur 10 minute ki life wala token banati hai, phir chaar cheezein try karti hai. Token ki sirf pehli koshish allowed hai. Token khud kabhi print nahi hota.</p>
<pre class="code">import hvac
from hvac.exceptions import Forbidden

admin = hvac.Client()
made = admin.auth.token.create(policies=["net-read"], ttl="10m")
auth = made["auth"]
print("policies:", sorted(auth["policies"]), "| lease:", auth["lease_duration"], "s | renewable:", auth["renewable"])

limited = hvac.Client(token=auth["client_token"])         <span class="c"># the token itself is never printed</span>
info = limited.auth.token.lookup_self()["data"]
print("ttl left &lt;= 600:", info["ttl"] &lt;= 600)
print("read net/r1  :", limited.secrets.kv.v2.read_secret_version(path="net/r1")["data"]["data"]["user"])
for label, call in (
    ("write net/r1", lambda: limited.secrets.kv.v2.create_or_update_secret(path="net/r1", secret={"x": 1})),
    ("read net/other", lambda: limited.secrets.kv.v2.read_secret_version(path="other/x")),
    ("list policies", lambda: limited.sys.list_policies()),
):
    try:
        call()
    except Forbidden:
        print(f"{label:&lt;15}: Forbidden")
print("renewed lease:", limited.auth.token.renew_self()["auth"]["lease_duration"], "s")
limited.auth.token.revoke_self()
print("after revoke_self:", limited.is_authenticated())</pre>
<pre class="out">AUTO01$ python3 tokens.py
policies: ['default', 'net-read'] | lease: 600 s | renewable: True
ttl left &lt;= 600: True
read net/r1  : netops
<span class="hl">write net/r1   : Forbidden</span>
<span class="hl">read net/other : Forbidden</span>
<span class="hl">list policies  : Forbidden</span>
renewed lease: 600 s
<span class="hl">after revoke_self: False</span></pre>
<p>Yahan tak ki <code>list policies</code> bhi mana hai, kyunki policy API <code>sys/policies</code> par rehti hai, jo is policy mein likha hi nahi. Vault har token mein jo <code>default</code> policy jodta hai woh sirf apna lookup jaisi cheezein allow karti hai.</p>

<h3>Least privilege, practice mein</h3>
<ul><li>Har kaam ke liye ek policy, kaam ke naam par (<code>net-read</code>, <code>net-rotate</code>), kisi insaan ke naam par nahi.</li><li>Collectors ke liye read-only. Password rotate karne wale job ke liye alag, kam use hone wala role.</li><li>Sabse sankara path jo chal jaaye: <code>secret/data/net/*</code>, <code>secret/*</code> nahi.</li><li>Chhote TTL aur kaam khatam hote hi <code>revoke_self()</code>.</li><li>Setup token ko kabhi script, cron file ya CI variable mein mat daalo.</li></ul>

<div class="warn"><p><b>Aam galti.</b> <code>secret/data/net/*</code> par <code>list</code> dena aur sochna ki names list kyun nahi hote. Listing metadata operation hai: capability <code>secret/metadata/net/*</code> par lagti hai.</p></div>
<div class="note"><p><b>Lab mein aur asli gear par.</b> Lab woh policy language samajhta hai jo yahan chahiye (path blocks, capabilities, <code>*</code> aur <code>+</code>). Syntax error Vault ka "1 error occurred" wording deta hai. Sentinel rules aur namespaces simulate nahi hote. Lab mein tokens lab clock se expire hote hain, aur kisi doosre din ka banaya token dikhaya nahi ja sakta, isliye Lab 2 tumhe ek purana token deti hai.</p></div>

<div class="scn"><h4>Ek wildcard zyada</h4><p>"Chalane" ke liye ek team ne collector ko policy <code>path "secret/*" { capabilities = ["create","read","update","delete","list"] }</code> de di. Phir clean-up function ke bug ne har device secret delete kar diya, aur policy dekh kar koi nahi keh sakta tha ki yeh mumkin hai. Fix do policies thi: collectors ke liye read-only, aur clean-up job ke liye apne path par sankara delete right.</p><p><b>Seekh:</b> Policy us kaam ke liye likho jo script aaj karti hai, us ke liye nahi jo kabhi kar sakti hai.</p></div>

<div class="iv"><p class="q">"Vault mein least privilege ka matlab kya hai?"</p><p>Har client ko ek policy milti hai jisme sirf wahi paths aur capabilities hain jo uske kaam ko chahiye, aur ek token jo kaam jitna hi jeeta hai. Collector ko device secrets par read milta hai aur kuch nahi; rotation job ko theek unhi paths par update; log apni identity se sign in karte hain. Ek token leak ho to nuksan limited hai aur token revoke karna aasan hai.</p></div>

<div class="kt"><p><b>Mukhya baatein</b></p><ul><li>Token ek lease hai jis par policies lagi hain; woh expire hota hai, maximum tak renew ho sakta hai aur revoke ho sakta hai.</li><li>Koi policy block match na kare to permission denied; deny hamesha jeetta hai.</li><li>KV version 2 ke liye: <code>data/</code> par <code>read</code>, <code>metadata/</code> par <code>list</code>.</li><li>Script ki policy mein create, update, delete tab tak nahi jab tak script sach mein likhti nahi.</li><li>Kaam khatam hote hi <code>revoke_self()</code> call karo.</li></ul></div>
`}};export{e as default};