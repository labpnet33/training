var e={id:`versions-delete`,h:{en:`Versions, soft delete, undelete and destroy`,hi:`Versions, soft delete, undelete aur destroy`},body:{en:`
<p>The best feature of KV version 2 is the one that only shows up on a bad day: you can get a secret back. It keeps old versions, it treats <code>delete</code> as a reversible mark and it lets you prove who changed what, once. This chapter shows each operation from Python and from the command line, and the single symptom that fools most people: a deleted secret and a secret that never existed look the same to your script.</p>

<h3>An analogy: bank statements and a shredder</h3>
<p>The bank keeps every monthly statement. A clerk can stamp one VOID: it stays in the folder, only marked. A different button sends one statement through the shredder: gone for good, though the folder still shows that a statement once existed. A third one clears the whole folder.</p>
<table class="cmp"><tr><th>Action</th><th>Command</th><th>hvac call</th><th>Can you undo it?</th></tr><tr><td>Write</td><td><code>kv put</code></td><td><code>create_or_update_secret</code></td><td>Write the old content again as a new version</td></tr><tr><td>Delete latest</td><td><code>kv delete</code></td><td><code>delete_latest_version_of_secret</code></td><td>Yes: <code>undelete</code></td></tr><tr><td>Undelete</td><td><code>kv undelete -versions=2</code></td><td><code>undelete_secret_versions(versions=[2])</code></td><td>Yes: delete again</td></tr><tr><td>Destroy</td><td><code>kv destroy -versions=1</code></td><td><code>destroy_secret_versions(versions=[1])</code></td><td><b>No.</b> The data of that version is gone</td></tr><tr><td>Delete everything</td><td><code>kv metadata delete</code></td><td><code>delete_metadata_and_all_versions</code></td><td><b>No.</b> All versions and the history</td></tr></table>

<h3>All of it in one script</h3>
<pre class="code">import hvac
from hvac.exceptions import InvalidPath, InvalidRequest

kv = hvac.Client().secrets.kv.v2
for n in (1, 2, 3):
    r = kv.create_or_update_secret(path="net/rot", secret={"password": f"demo-only-{n}"})
    print("write", n, "-&gt; version", r["data"]["version"])

print("current  :", kv.read_secret_version(path="net/rot")["data"]["data"]["password"])
print("version 1:", kv.read_secret_version(path="net/rot", version=1)["data"]["data"]["password"])

kv.delete_latest_version_of_secret(path="net/rot")          <span class="c"># soft delete of version 3</span>
try:
    kv.read_secret_version(path="net/rot")
except InvalidPath as err:
    print("after delete:", err)
meta = kv.read_secret_metadata(path="net/rot")["data"]
print("current_version:", meta["current_version"], "| deleted marker set:", bool(meta["versions"]["3"]["deletion_time"]))

kv.undelete_secret_versions(path="net/rot", versions=[3])
print("after undelete:", kv.read_secret_version(path="net/rot")["data"]["data"]["password"])

kv.destroy_secret_versions(path="net/rot", versions=[1])    <span class="c"># gone for good</span>
print("version 1 destroyed:", kv.read_secret_metadata(path="net/rot")["data"]["versions"]["1"]["destroyed"])

try:                                                          <span class="c"># check-and-set: only write if still version 3</span>
    kv.create_or_update_secret(path="net/rot", secret={"password": "x"}, cas=1)
except InvalidRequest as err:
    print("cas refused:", err)
r = kv.create_or_update_secret(path="net/rot", secret={"password": "demo-only-4"}, cas=3)
print("cas accepted, version", r["data"]["version"])

kv.patch(path="net/rot", secret={"note": "rotated by lesson"})
print("after patch:", sorted(kv.read_secret_version(path="net/rot")["data"]["data"]))
kv.delete_metadata_and_all_versions(path="net/rot")
try:
    kv.read_secret_metadata(path="net/rot")
except InvalidPath:
    print("net/rot is gone, every version")</pre>
<pre class="out">AUTO01$ python3 hvac3.py
write 1 -&gt; version 1
write 2 -&gt; version 2
write 3 -&gt; version 3
current  : demo-only-3
version 1: demo-only-1
<span class="hl">after delete: None</span>, on get h&#116;tp://10.99.0.70:8200/v1/secret/data/net/rot
current_version: 3 | <span class="hl">deleted marker set: True</span>
after undelete: demo-only-3
<span class="hl">version 1 destroyed: True</span>
<span class="hl">cas refused: check-and-set parameter did not match the current version, on post h&#116;tp://10.99.0.70:8200/v1/secret/data/net/rot</span>
<span class="hl">cas accepted, version 4</span>
after patch: ['note', 'password']
net/rot is gone, every version</pre>
<p>Read the output from the top. Three writes make three versions; <code>version=1</code> still returns the first password. After <code>delete_latest_version_of_secret</code> a normal read raises <code>InvalidPath</code> with message <code>None</code>, exactly what a path that never existed gives. Only the metadata tells the difference: version 3 has a <code>deletion_time</code>. <code>undelete</code> brings it back. <code>destroy</code> on version 1 sets <code>destroyed</code> to <code>True</code> for good.</p>

<h3>The same from the command line</h3>
<pre class="out">AUTO01$ vault kv delete secret/net/demo
Success! Data deleted (if it existed) at: secret/data/net/demo</pre>
<pre class="out">AUTO01$ vault kv get secret/net/demo
======= Metadata =======
Key                Value
---                -----
created_time       2026-10-11T15:27:24.208766259Z
custom_metadata    &lt;nil&gt;
<span class="hl">deletion_time      2026-10-11T15:27:26.638995839Z</span>
destroyed          false
version            2

<span class="hl">No value found at secret/data/net/demo</span></pre>
<p>The command is more helpful than the library: it prints the metadata, including <code>deletion_time</code>, and then says <code>No value found</code>. Bring the version back and read a destroyed one:</p>
<pre class="out">AUTO01$ vault kv undelete -versions=2 secret/net/demo
Success! Data written to: secret/undelete/net/demo</pre>
<pre class="out">AUTO01$ vault kv get -version=1 secret/net/demo
======= Metadata =======
Key                Value
---                -----
created_time       2026-10-11T15:27:22.386619595Z
custom_metadata    &lt;nil&gt;
deletion_time      n/a
<span class="hl">destroyed          true</span>
version            1

<span class="hl">No value found at secret/data/net/demo</span></pre>
<p>For the whole picture, the metadata lists every version and says which is current:</p>
<pre class="out">AUTO01$ vault kv metadata get secret/net/demo
========== Metadata ==========
Key                     Value
---                     -----
cas_required            false
created_time            2026-10-11T15:27:22.386727565Z
<span class="hl">current_version         2</span>
custom_metadata         &lt;nil&gt;
delete_version_after    0s
<span class="hl">max_versions            0</span>
<span class="hl">oldest_version          1</span>
updated_time            2026-10-11T15:27:24.208766259Z

====== Version 1 ======
Key              Value
---              -----
created_time     2026-10-11T15:27:22.386619595Z
deletion_time    n/a
destroyed        false

====== Version 2 ======
Key              Value
---              -----
created_time     2026-10-11T15:27:24.208766259Z
deletion_time    n/a
destroyed        false</pre>

<h3>Check-and-set: two writers, one winner</h3>
<p>Imagine two engineers rotating the same password. Without protection the later write silently replaces the earlier one. With <code>cas=3</code> the write succeeds only if the current version is still 3; otherwise Vault answers 400 and hvac raises <code>InvalidRequest</code> (see <code>cas refused</code> above). Always read the version, then write with <code>cas=</code> that version.</p>

<h3>How many versions are kept?</h3>
<p>Not all of them. Vault keeps the newest ones and drops the older ones (ten by default; the metadata shows <code>max_versions 0</code> for "use the default"). You can set it per secret with <code>update_metadata</code>.</p>
<pre class="code">import hvac

kv = hvac.Client().secrets.kv.v2
kv.create_or_update_secret(path="net/short", secret={"password": "demo-only-0"})
kv.update_metadata(path="net/short", max_versions=3)        <span class="c"># keep only the last three versions</span>
for n in range(1, 6):
    kv.create_or_update_secret(path="net/short", secret={"password": f"demo-only-{n}"})
meta = kv.read_secret_metadata(path="net/short")["data"]
print("current_version:", meta["current_version"], "| oldest_version:", meta["oldest_version"])
print("versions still stored:", sorted(meta["versions"], key=int))
kv.delete_metadata_and_all_versions(path="net/short")</pre>
<pre class="out">AUTO01$ python3 maxver.py
<span class="hl">current_version: 6 | oldest_version: 4</span>
<span class="hl">versions still stored: ['4', '5', '6']</span></pre>

<h3>A safe rotation, step by step</h3>
<ol>
<li>Read the current version number and keep it.</li>
<li>Write the new password as a new version with <code>cas=</code> that number.</li>
<li>Change the device to the new password.</li>
<li>Log in to the device with the value read back from Vault. If it fails, write the old content again as a new version and investigate; the old version is still there to copy from.</li>
</ol>

<div class="warn"><p><b>Common mistake.</b> Using <code>destroy</code> when you meant <code>delete</code>. After a destroy there is nothing to undelete. Make scripts and people use the normal delete, and keep destroy for the day a secret really leaked and the old values must disappear.</p></div>
<div class="exam"><p><b>Exam trap.</b> A 404 from KV version 2 does not prove the path was never written. The latest version may be soft-deleted. Look at the metadata for <code>deletion_time</code> before you decide to write the secret again.</p></div>

<div class="scn"><h4>N1 vanished overnight</h4><p>The collector failed on N1 with InvalidPath. The engineer, sure that nobody had touched Vault, wrote a new secret from memory and got the NX-OS password wrong, which locked the account on three switches. The metadata would have shown that a clean-up job had soft-deleted version 1 at 02:00. <code>undelete</code> brings the right value back in one command, and the version number stays 1.</p><p><b>Lesson:</b> Read the metadata before you rewrite a secret.</p></div>

<div class="iv"><p class="q">"A script gets InvalidPath for a secret that existed yesterday. What do you check?"</p><p>First the path and the mount point, because a typo gives the same error. Then the metadata: if the latest version has a deletion_time it was soft-deleted and I can undelete it; if destroyed is true the data is gone and I must recreate it from the source of truth. Then I find out who or what deleted it, and fix that.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>KV version 2 keeps versions; a normal write never overwrites.</li><li>Delete is a reversible mark, undelete reverses it, destroy and metadata delete cannot be undone.</li><li>A soft-deleted secret raises <code>InvalidPath</code> with message <code>None</code>, like a missing one; the metadata tells them apart.</li><li><code>cas=</code> turns a silent overwrite into an error when two writers collide.</li><li>Old versions are dropped past <code>max_versions</code>; set it for secrets you may need to roll back.</li></ul></div>
`,hi:`
<p>KV version 2 ki sabse achhi khoobi woh hai jo sirf buri din dikhti hai: tum secret wapas la sakte ho. Yeh purane versions rakhta hai, <code>delete</code> ko reversible mark maanta hai aur ek baar yeh sabit karne deta hai ki kisne kya badla. Yeh chapter har operation Python aur command line se dikhata hai, aur woh ek symptom jo zyadatar logon ko dhokha deta hai: deleted secret aur kabhi na bana secret tumhari script ko ek jaise dikhte hain.</p>

<h3>Ek analogy: bank statements aur shredder</h3>
<p>Bank har mahine ka statement rakhta hai. Clerk ek par VOID ki mohar laga sakta hai: woh folder mein rehta hai, bas marked. Doosra button ek statement ko shredder se guzarta hai: hamesha ke liye gaya, par folder dikhata hai ki kabhi ek statement tha. Teesra poora folder saaf kar deta hai.</p>
<table class="cmp"><tr><th>Action</th><th>Command</th><th>hvac call</th><th>Undo ho sakta hai?</th></tr><tr><td>Write</td><td><code>kv put</code></td><td><code>create_or_update_secret</code></td><td>Purana content naye version ke roop mein dobara likho</td></tr><tr><td>Delete latest</td><td><code>kv delete</code></td><td><code>delete_latest_version_of_secret</code></td><td>Haan: <code>undelete</code></td></tr><tr><td>Undelete</td><td><code>kv undelete -versions=2</code></td><td><code>undelete_secret_versions(versions=[2])</code></td><td>Haan: dobara delete karo</td></tr><tr><td>Destroy</td><td><code>kv destroy -versions=1</code></td><td><code>destroy_secret_versions(versions=[1])</code></td><td><b>Nahi.</b> Us version ka data gaya</td></tr><tr><td>Sab delete</td><td><code>kv metadata delete</code></td><td><code>delete_metadata_and_all_versions</code></td><td><b>Nahi.</b> Saare versions aur history</td></tr></table>

<h3>Sab kuch ek script mein</h3>
<pre class="code">import hvac
from hvac.exceptions import InvalidPath, InvalidRequest

kv = hvac.Client().secrets.kv.v2
for n in (1, 2, 3):
    r = kv.create_or_update_secret(path="net/rot", secret={"password": f"demo-only-{n}"})
    print("write", n, "-&gt; version", r["data"]["version"])

print("current  :", kv.read_secret_version(path="net/rot")["data"]["data"]["password"])
print("version 1:", kv.read_secret_version(path="net/rot", version=1)["data"]["data"]["password"])

kv.delete_latest_version_of_secret(path="net/rot")          <span class="c"># soft delete of version 3</span>
try:
    kv.read_secret_version(path="net/rot")
except InvalidPath as err:
    print("after delete:", err)
meta = kv.read_secret_metadata(path="net/rot")["data"]
print("current_version:", meta["current_version"], "| deleted marker set:", bool(meta["versions"]["3"]["deletion_time"]))

kv.undelete_secret_versions(path="net/rot", versions=[3])
print("after undelete:", kv.read_secret_version(path="net/rot")["data"]["data"]["password"])

kv.destroy_secret_versions(path="net/rot", versions=[1])    <span class="c"># gone for good</span>
print("version 1 destroyed:", kv.read_secret_metadata(path="net/rot")["data"]["versions"]["1"]["destroyed"])

try:                                                          <span class="c"># check-and-set: only write if still version 3</span>
    kv.create_or_update_secret(path="net/rot", secret={"password": "x"}, cas=1)
except InvalidRequest as err:
    print("cas refused:", err)
r = kv.create_or_update_secret(path="net/rot", secret={"password": "demo-only-4"}, cas=3)
print("cas accepted, version", r["data"]["version"])

kv.patch(path="net/rot", secret={"note": "rotated by lesson"})
print("after patch:", sorted(kv.read_secret_version(path="net/rot")["data"]["data"]))
kv.delete_metadata_and_all_versions(path="net/rot")
try:
    kv.read_secret_metadata(path="net/rot")
except InvalidPath:
    print("net/rot is gone, every version")</pre>
<pre class="out">AUTO01$ python3 hvac3.py
write 1 -&gt; version 1
write 2 -&gt; version 2
write 3 -&gt; version 3
current  : demo-only-3
version 1: demo-only-1
<span class="hl">after delete: None</span>, on get h&#116;tp://10.99.0.70:8200/v1/secret/data/net/rot
current_version: 3 | <span class="hl">deleted marker set: True</span>
after undelete: demo-only-3
<span class="hl">version 1 destroyed: True</span>
<span class="hl">cas refused: check-and-set parameter did not match the current version, on post h&#116;tp://10.99.0.70:8200/v1/secret/data/net/rot</span>
<span class="hl">cas accepted, version 4</span>
after patch: ['note', 'password']
net/rot is gone, every version</pre>
<p>Output upar se padho. Teen writes se teen versions bante hain; <code>version=1</code> ab bhi pehla password deta hai. <code>delete_latest_version_of_secret</code> ke baad normal read <code>InvalidPath</code> raise karta hai message <code>None</code> ke saath, bilkul wahi jo kabhi na bana path deta hai. Farak sirf metadata batata hai: version 3 ka <code>deletion_time</code> hai. <code>undelete</code> use wapas laata hai. Version 1 par <code>destroy</code> <code>destroyed</code> ko hamesha ke liye <code>True</code> kar deta hai.</p>

<h3>Wahi command line se</h3>
<pre class="out">AUTO01$ vault kv delete secret/net/demo
Success! Data deleted (if it existed) at: secret/data/net/demo</pre>
<pre class="out">AUTO01$ vault kv get secret/net/demo
======= Metadata =======
Key                Value
---                -----
created_time       2026-10-11T15:27:24.208766259Z
custom_metadata    &lt;nil&gt;
<span class="hl">deletion_time      2026-10-11T15:27:26.638995839Z</span>
destroyed          false
version            2

<span class="hl">No value found at secret/data/net/demo</span></pre>
<p>Command library se zyada madadgaar hai: woh metadata, <code>deletion_time</code> samet, print karti hai aur phir <code>No value found</code> kehti hai. Version wapas lao aur destroyed wala padho:</p>
<pre class="out">AUTO01$ vault kv undelete -versions=2 secret/net/demo
Success! Data written to: secret/undelete/net/demo</pre>
<pre class="out">AUTO01$ vault kv get -version=1 secret/net/demo
======= Metadata =======
Key                Value
---                -----
created_time       2026-10-11T15:27:22.386619595Z
custom_metadata    &lt;nil&gt;
deletion_time      n/a
<span class="hl">destroyed          true</span>
version            1

<span class="hl">No value found at secret/data/net/demo</span></pre>
<p>Poori tasveer ke liye metadata har version list karta hai aur batata hai kaunsa current hai:</p>
<pre class="out">AUTO01$ vault kv metadata get secret/net/demo
========== Metadata ==========
Key                     Value
---                     -----
cas_required            false
created_time            2026-10-11T15:27:22.386727565Z
<span class="hl">current_version         2</span>
custom_metadata         &lt;nil&gt;
delete_version_after    0s
<span class="hl">max_versions            0</span>
<span class="hl">oldest_version          1</span>
updated_time            2026-10-11T15:27:24.208766259Z

====== Version 1 ======
Key              Value
---              -----
created_time     2026-10-11T15:27:22.386619595Z
deletion_time    n/a
destroyed        false

====== Version 2 ======
Key              Value
---              -----
created_time     2026-10-11T15:27:24.208766259Z
deletion_time    n/a
destroyed        false</pre>

<h3>Check-and-set: do writers, ek jeetne wala</h3>
<p>Do engineers ek hi password rotate kar rahe hain, socho. Bina protection ke baad wala write chupchaap pehle wale ko replace kar deta hai. <code>cas=3</code> ke saath write tabhi chalta hai jab current version abhi bhi 3 ho; warna Vault 400 deta hai aur hvac <code>InvalidRequest</code> raise karta hai (upar <code>cas refused</code> dekho). Hamesha pehle version padho, phir usi version ke <code>cas=</code> ke saath likho.</p>

<h3>Kitne versions rakhe jaate hain?</h3>
<p>Sab nahi. Vault naye versions rakhta hai aur purane hata deta hai (default mein das; metadata <code>max_versions 0</code> dikhata hai, matlab "default use karo"). Ise har secret ke liye <code>update_metadata</code> se set kar sakte ho.</p>
<pre class="code">import hvac

kv = hvac.Client().secrets.kv.v2
kv.create_or_update_secret(path="net/short", secret={"password": "demo-only-0"})
kv.update_metadata(path="net/short", max_versions=3)        <span class="c"># keep only the last three versions</span>
for n in range(1, 6):
    kv.create_or_update_secret(path="net/short", secret={"password": f"demo-only-{n}"})
meta = kv.read_secret_metadata(path="net/short")["data"]
print("current_version:", meta["current_version"], "| oldest_version:", meta["oldest_version"])
print("versions still stored:", sorted(meta["versions"], key=int))
kv.delete_metadata_and_all_versions(path="net/short")</pre>
<pre class="out">AUTO01$ python3 maxver.py
<span class="hl">current_version: 6 | oldest_version: 4</span>
<span class="hl">versions still stored: ['4', '5', '6']</span></pre>

<h3>Surakshit rotation, step by step</h3>
<ol>
<li>Current version number padho aur yaad rakho.</li>
<li>Naya password us number ke <code>cas=</code> ke saath naye version ke roop mein likho.</li>
<li>Device ko naye password par badlo.</li>
<li>Vault se wapas padhi value se device mein login karo. Fail ho to purana content naye version ke roop mein dobara likho aur wajah dhundo; purana version copy karne ke liye abhi bhi maujood hai.</li>
</ol>

<div class="warn"><p><b>Aam galti.</b> <code>delete</code> ki jagah <code>destroy</code> use karna. Destroy ke baad undelete karne ko kuch nahi bachta. Scripts aur logon se normal delete karwao, aur destroy us din ke liye rakho jab secret sach mein leak hua ho aur purani values hatani hon.</p></div>
<div class="exam"><p><b>Exam trap.</b> KV version 2 se 404 ka matlab yeh nahi ki path kabhi likha hi nahi gaya. Latest version soft-deleted ho sakta hai. Secret dobara likhne se pehle metadata mein <code>deletion_time</code> dekho.</p></div>

<div class="scn"><h4>N1 raat bhar mein gayab</h4><p>Collector N1 par InvalidPath ke saath fail hua. Engineer ne, yaqeen se ki Vault ko kisi ne chhua nahi, yaad se naya secret likh diya aur NX-OS password galat likha, jisse teen switches par account lock ho gaya. Metadata dikhata ki ek clean-up job ne 02:00 baje version 1 soft-delete kiya tha. <code>undelete</code> ek command mein sahi value wapas laata hai, aur version number 1 hi rehta hai.</p><p><b>Seekh:</b> Secret dobara likhne se pehle metadata padho.</p></div>

<div class="iv"><p class="q">"Script ko kal tak maujood secret par InvalidPath mil raha hai. Kya check karte ho?"</p><p>Pehle path aur mount point, kyunki typo bhi wahi error deta hai. Phir metadata: agar latest version ka deletion_time hai to woh soft-delete hua hai aur main undelete kar sakta hoon; agar destroyed true hai to data gaya aur mujhe use source of truth se dobara banana hoga. Phir pata lagata hoon ki kisne ya kis job ne delete kiya, aur use theek karta hoon.</p></div>

<div class="kt"><p><b>Mukhya baatein</b></p><ul><li>KV version 2 versions rakhta hai; normal write kabhi overwrite nahi karta.</li><li>Delete reversible mark hai, undelete use ulat deta hai, destroy aur metadata delete undo nahi hote.</li><li>Soft-deleted secret missing secret ki tarah message <code>None</code> ke saath <code>InvalidPath</code> deta hai; metadata dono ko alag batata hai.</li><li><code>cas=</code> chupchaap overwrite ko error bana deta hai jab do writers takrate hain.</li><li><code>max_versions</code> ke baad purane versions hat jaate hain; jin secrets ko roll back karna pad sakta hai unke liye set karo.</li></ul></div>
`}};export{e as default};