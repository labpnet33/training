var e={id:`objects-idempotent`,h:{en:`Address objects and groups: the idempotent ensure()`,hi:`Address objects aur groups: idempotent ensure()`},body:{en:`
<p>Now the script starts to change the firewall. The rule for the whole module is simple: <b>a change script must be safe to run twice</b>. The tool that gives you that rule is one small function, <code>ensure()</code>. This is Lab 1, step 3.</p>

<h3>An analogy: switching on a light</h3>
<p>"Toggle the light" is not idempotent: pressed twice, the room is dark again. "Make sure the light is on" is idempotent: pressed ten times, the room is lit. A firewall script must say "make sure web1 exists with this subnet", never "create web1". The first is safe after a crash, a retry or a second engineer running the same ticket.</p>

<h3>The logic in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="The ensure() decision"><rect x="8" y="80" width="110" height="56" rx="10" fill="#bae6fd"/><text x="63" y="105" text-anchor="middle" class="svg-ink" font-size="12">find()</text><text x="63" y="122" text-anchor="middle" class="svg-muted" font-size="11">GET ?filter</text><line x1="118" y1="108" x2="168" y2="108" stroke="#64748b" stroke-width="2"/><polygon points="168,108 160,104 160,112" fill="#64748b"/><polygon points="236,64 304,108 236,152 168,108" fill="#fde68a"/><text x="236" y="112" text-anchor="middle" class="svg-ink" font-size="12">exists?</text><line x1="236" y1="64" x2="236" y2="36" stroke="#64748b" stroke-width="2"/><polygon points="236,36 232,44 240,44" fill="#64748b"/><text x="290" y="40" text-anchor="middle" class="svg-muted" font-size="11">no</text><rect x="166" y="4" width="140" height="32" rx="10" fill="#bbf7d0"/><text x="236" y="24" text-anchor="middle" class="svg-ink" font-size="12">POST: created</text><line x1="304" y1="108" x2="354" y2="108" stroke="#64748b" stroke-width="2"/><polygon points="354,108 346,104 346,112" fill="#64748b"/><text x="334" y="100" text-anchor="middle" class="svg-muted" font-size="11">yes</text><polygon points="424,64 492,108 424,152 356,108" fill="#fde68a"/><text x="424" y="112" text-anchor="middle" class="svg-ink" font-size="12">differs?</text><line x1="492" y1="108" x2="540" y2="108" stroke="#64748b" stroke-width="2"/><polygon points="540,108 532,104 532,112" fill="#64748b"/><text x="516" y="100" text-anchor="middle" class="svg-muted" font-size="11">yes</text><rect x="540" y="82" width="92" height="52" rx="10" fill="#bbf7d0"/><text x="586" y="105" text-anchor="middle" class="svg-ink" font-size="12">PUT</text><text x="586" y="122" text-anchor="middle" class="svg-muted" font-size="11">updated</text><line x1="424" y1="152" x2="424" y2="184" stroke="#64748b" stroke-width="2"/><polygon points="424,184 420,176 428,176" fill="#64748b"/><text x="470" y="172" text-anchor="middle" class="svg-muted" font-size="11">no</text><rect x="354" y="186" width="140" height="36" rx="10" fill="#e2e8f0"/><text x="424" y="201" text-anchor="middle" class="svg-ink" font-size="12">do nothing</text><text x="424" y="218" text-anchor="middle" class="svg-muted" font-size="11">unchanged</text></svg><p class="cap">Look before you write. The second run finds nothing to do and touches nothing.</p></div>
<p>Three outcomes only: <b>created</b> (it was missing), <b>updated</b> (it existed but a field differed) or <b>unchanged</b> (it already matched). Nothing is sent to the firewall in the last case.</p>

<h3>The code</h3>
<p>Add this to <code>fgt.py</code>, below the client of chapter 3:</p>
<pre class="code">

def find(s, path, name):
    """Return the one object called name, or None. The filter works for address, group and policy tables."""
    found = call(s, "GET", "/cmdb/" + path, params={"filter": "name==" + name})["results"]
    return found[0] if found else None


def norm(value):
    """FortiOS returns lists as [{"name": "web1", "q_origin_key": "web1"}]: compare plain names."""
    if isinstance(value, list):
        return [x["name"] if isinstance(x, dict) and "name" in x else x for x in value]
    return value


def differs(have, want):
    return {k: v for k, v in want.items() if norm(have.get(k)) != norm(v)}


def ensure(s, path, body):
    """Create the object when it is missing, update only what differs, else do nothing."""
    have = find(s, path, body["name"])
    if have is None:
        reply = call(s, "POST", "/cmdb/" + path, json=body)
        return "created", reply["mkey"]
    delta = differs(have, body)
    if not delta:
        return "unchanged", have["q_origin_key"]
    call(s, "PUT", "/cmdb/%s/%s" % (path, have["q_origin_key"]), json=delta)
    return "updated", have["q_origin_key"]</pre>
<p>Walk through the four functions:</p>
<ul>
<li><code>find()</code> asks for exactly one name with <code>filter=name==...</code> and returns the object or <code>None</code>. It works the same for addresses, groups and policies.</li>
<li><code>norm()</code> fixes a real annoyance. You send a group member as <code>[{"name": "web1"}]</code>, but FortiOS answers with <code>[{"name": "web1", "q_origin_key": "web1"}]</code>. Compared as they are, the two are never equal and the script would "update" forever. <code>norm()</code> reduces both to <code>["web1"]</code>.</li>
<li><code>differs()</code> returns only the fields where the wanted value is different from the current one. Fields you did not mention (like the generated <code>uuid</code>) are ignored.</li>
<li><code>ensure()</code> glues them. On create it returns the new key from the reply (<code>mkey</code>). On update it sends a <b>PUT with only the delta</b>, so it cannot overwrite a field someone else set.</li>
</ul>

<h3>The change script</h3>
<p>For CHG-3105 the ticket asks for two web servers and a group. The data sits at the top and the loop is trivial:</p>
<pre class="code">from fgt import ensure, session

ADDRESSES = [("web1", "10.20.0.10 255.255.255.255"), ("web2", "10.20.0.11 255.255.255.255")]

s = session()
for name, subnet in ADDRESSES:
    action, mkey = ensure(s, "firewall/address", {"name": name, "subnet": subnet, "comment": "CHG-3105"})
    print("address  %-12s %s" % (name, action))
group = {"name": "WEB-SERVERS", "member": [{"name": n} for n, _ in ADDRESSES], "comment": "CHG-3105"}
action, mkey = ensure(s, "firewall/addrgrp", group)
print("addrgrp  %-12s %s" % (group["name"], action))</pre>
<p>Run it twice. The second run must change nothing:</p>
<pre class="out">AUTO01$ python3 objects.py
<span class="hl">address  web1         created</span>
<span class="hl">address  web2         created</span>
<span class="hl">addrgrp  WEB-SERVERS  created</span>
AUTO01$ python3 objects.py
<span class="hl">address  web1         unchanged</span>
<span class="hl">address  web2         unchanged</span>
<span class="hl">addrgrp  WEB-SERVERS  unchanged</span></pre>
<p>Look at the result on the firewall itself, in the CLI the way the console shows it:</p>
<pre class="out">FGT1 # show firewall address web2
config firewall address
    edit "web2"
        set uuid c7a76f7c-ea74-518e-ed2b-416c4d083808
<span class="hl">        set subnet 10.20.0.11 255.255.255.255</span>
<span class="hl">        set comment "CHG-3105"</span>
    next
end</pre>
<pre class="out">FGT1 # show firewall addrgrp
config firewall addrgrp
    edit "WEB-SERVERS"
        set uuid e272ff26-621a-51f8-a7ed-922220b0411e
<span class="hl">        set member "web1" "web2"</span>
        set comment "CHG-3105"
    next
end</pre>
<p>The comment <code>CHG-3105</code> travels with every object, so a colleague who finds <code>web2</code> six months later knows which ticket created it. Put the ticket number in every object you create.</p>

<h3>What happens without ensure()</h3>
<p>Plain creation of an object that exists is refused. The firewall also keeps the <b>error number</b> next to the status, and that number is what you should read:</p>
<pre class="code">from fgt import FortiError, call, ensure, session

s = session()
try:
    call(s, "POST", "/cmdb/firewall/address", json={"name": "web1", "subnet": "10.20.0.10 255.255.255.255"})
except FortiError as err:
    print(err)
print(ensure(s, "firewall/address", {"name": "web2", "subnet": "10.20.0.12 255.255.255.255"}))
print(ensure(s, "firewall/address", {"name": "web2", "subnet": "10.20.0.12 255.255.255.255"}))
print(ensure(s, "firewall/address", {"name": "web2", "subnet": "10.20.0.11 255.255.255.255"}))</pre>
<pre class="out">AUTO01$ python3 dupe.py
<span class="hl">POST /cmdb/firewall/address -&gt; status 424, FortiOS error -5 The entry already exists.</span>
<span class="hl">('updated', 'web2')</span>
<span class="hl">('unchanged', 'web2')</span>
<span class="hl">('updated', 'web2')</span></pre>
<p>The first line is the raw refusal: status 424, FortiOS error -5, "The entry already exists." Then <code>ensure()</code> changes <code>web2</code> to a new subnet (<code>updated</code>), runs again with the same value (<code>unchanged</code>), and puts the original value back (<code>updated</code>). This is exactly the drift repair you will use in chapter 9.</p>

<h3>The same two calls in curl</h3>
<p>When you teach a colleague, show the bare calls once. A POST creates and returns the key; a DELETE removes and returns the same envelope:</p>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Bearer $FGT_TOKEN" -X POST -H "Content-Type: application/json" -d '{"name":"curl1","subnet":"10.20.0.30 255.255.255.255"}' h&#116;tps://10.99.0.41/api/v2/cmdb/firewall/address
{
  "http_method":"POST",
  "revision":"bcd5068fbdd50822bed509b5b7d4feb0",
<span class="hl">  "mkey":"curl1",</span>
  "vdom":"root",
  "path":"firewall",
  "name":"address",
<span class="hl">  "status":"success",</span>
  "http_status":200,
  "serial":"FGVMEV5I0AL40000",
  "version":"v7.4.4",
  "build":2662
}</pre>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Bearer $FGT_TOKEN" -X DELETE -w "\\n%{http_code}\\n" h&#116;tps://10.99.0.41/api/v2/cmdb/firewall/address/curl1
{
  "http_method":"DELETE",
  "revision":"2540dff32640e1862740e3192840e4ac",
<span class="hl">  "mkey":"curl1",</span>
  "vdom":"root",
  "path":"firewall",
  "name":"address",
  "status":"success",
<span class="hl">  "http_status":200,</span>
  "serial":"FGVMEV5I0AL40000",
  "version":"v7.4.4",
  "build":2662
}
<span class="hl">200</span></pre>
<div class="eg"><p><b>Worked example: the half-finished change.</b> An engineer runs the ticket script. The group creation fails because someone fat-fingered a member name. The two addresses are already created. With plain POST scripts, the re-run fails at the first address ("already exists") and never reaches the group. With <code>ensure()</code>, the re-run reports <code>unchanged unchanged</code> for the addresses and creates the group. No manual cleanup, no fear.</p></div>

<div class="note"><p><b>In the lab vs on real gear.</b> The lab accepts an address with the same name as an existing one only through the update path, exactly as above. On a real FortiGate also be aware that an <b>address and an address group share one name space</b>: you cannot create a group called <code>web1</code> if an address <code>web1</code> exists. The error number tells you; the text of the message differs between firmware versions, so match on the number or on the HT&#84;P status, not on the words.</p></div>

<div class="warn"><p><b>Common mistakes.</b> POST without checking first. Sending the whole object in the update (you overwrite fields you did not mean to touch). Comparing lists without <code>norm()</code>. Using <code>PUT /cmdb/firewall/address</code> (collection) instead of <code>/address/web2</code> (one object). Forgetting that each write is live the moment the reply comes back.</p></div>
<div class="exam"><p><b>Exam trap.</b> On FortiOS and ASA REST there is <b>no commit and no candidate configuration</b>. A successful POST or PUT is already running config. That is the big contrast with NETCONF (candidate plus commit, chapter <code>adv-netconf</code>) and with PAN-OS (candidate plus commit, next module). Idempotence is your only safety net.</p></div>

<div class="scn"><h4>Two engineers, one ticket</h4><p>Two engineers on a night shift both started the script for CHG-3105, a few seconds apart. The old version of the script used plain POST: one of them got six "already exists" errors and thought the change had failed, so he started deleting objects "to try again". The new version prints <code>unchanged</code> six times for the second engineer and exits cleanly.</p><p><b>Lesson:</b> idempotent scripts turn a dangerous race into a harmless no-op. They are also the reason a retry after a timeout is safe.</p></div>

<div class="iv"><p class="q">"What does idempotent mean, and how do you make a firewall change script idempotent?"</p><p>Running it once or many times leaves the same end state. I look the object up first, create it only if it is missing, send only the fields that differ if it exists, and report created, updated or unchanged. I normalise the lists the device returns before I compare, and I tag objects with the change number.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ensure() = find, then POST if missing, PUT only the delta if different, else do nothing.</li>
<li>Report one of created, updated, unchanged; the second run of a good script says unchanged everywhere.</li>
<li>Normalise lists (name versus q_origin_key) before comparing.</li>
<li>A duplicate POST is refused with FortiOS error -5; read the number, not the text.</li>
<li>REST writes on FortiOS are live at once: no commit, no rollback.</li>
</ul></div>
`,hi:`
<p>Ab script firewall badalna shuru karti hai. Poore module ka niyam simple hai: <b>change script do baar chalane par bhi safe honi chahiye</b>. Yeh niyam ek chhota function deta hai, <code>ensure()</code>. Yeh Lab 1, step 3 hai.</p>

<h3>Ek analogy: light on karna</h3>
<p>"Light toggle karo" idempotent nahi hai: do baar dabane par kamra phir andhera. "Pakka karo ki light on hai" idempotent hai: das baar dabao, kamra roshan. Firewall script ko kehna chahiye "pakka karo ki web1 is subnet ke saath maujood hai", kabhi "web1 banao" nahi. Pehla crash, retry, ya wahi ticket chalate doosre engineer ke baad bhi safe hai.</p>

<h3>Logic ek tasveer mein</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="ensure() ka faisla"><rect x="8" y="80" width="110" height="56" rx="10" fill="#bae6fd"/><text x="63" y="105" text-anchor="middle" class="svg-ink" font-size="12">find()</text><text x="63" y="122" text-anchor="middle" class="svg-muted" font-size="11">GET ?filter</text><line x1="118" y1="108" x2="168" y2="108" stroke="#64748b" stroke-width="2"/><polygon points="168,108 160,104 160,112" fill="#64748b"/><polygon points="236,64 304,108 236,152 168,108" fill="#fde68a"/><text x="236" y="112" text-anchor="middle" class="svg-ink" font-size="12">hai?</text><line x1="236" y1="64" x2="236" y2="36" stroke="#64748b" stroke-width="2"/><polygon points="236,36 232,44 240,44" fill="#64748b"/><text x="290" y="40" text-anchor="middle" class="svg-muted" font-size="11">nahi</text><rect x="166" y="4" width="140" height="32" rx="10" fill="#bbf7d0"/><text x="236" y="24" text-anchor="middle" class="svg-ink" font-size="12">POST: created</text><line x1="304" y1="108" x2="354" y2="108" stroke="#64748b" stroke-width="2"/><polygon points="354,108 346,104 346,112" fill="#64748b"/><text x="334" y="100" text-anchor="middle" class="svg-muted" font-size="11">haan</text><polygon points="424,64 492,108 424,152 356,108" fill="#fde68a"/><text x="424" y="112" text-anchor="middle" class="svg-ink" font-size="12">alag?</text><line x1="492" y1="108" x2="540" y2="108" stroke="#64748b" stroke-width="2"/><polygon points="540,108 532,104 532,112" fill="#64748b"/><text x="516" y="100" text-anchor="middle" class="svg-muted" font-size="11">haan</text><rect x="540" y="82" width="92" height="52" rx="10" fill="#bbf7d0"/><text x="586" y="105" text-anchor="middle" class="svg-ink" font-size="12">PUT</text><text x="586" y="122" text-anchor="middle" class="svg-muted" font-size="11">updated</text><line x1="424" y1="152" x2="424" y2="184" stroke="#64748b" stroke-width="2"/><polygon points="424,184 420,176 428,176" fill="#64748b"/><text x="470" y="172" text-anchor="middle" class="svg-muted" font-size="11">nahi</text><rect x="354" y="186" width="140" height="36" rx="10" fill="#e2e8f0"/><text x="424" y="201" text-anchor="middle" class="svg-ink" font-size="12">kuch nahi</text><text x="424" y="218" text-anchor="middle" class="svg-muted" font-size="11">unchanged</text></svg><p class="cap">Likhne se pehle dekho. Doosre run mein karne ko kuch nahi milta aur kuch chhoota nahi.</p></div>
<p>Sirf teen nateeje: <b>created</b> (tha nahi), <b>updated</b> (tha, par ek field alag thi) ya <b>unchanged</b> (pehle se match karta tha). Aakhri case mein firewall ko kuch nahi bheja jaata.</p>

<h3>Code</h3>
<p>Isse <code>fgt.py</code> mein chapter 3 ke client ke neeche jodo:</p>
<pre class="code">

def find(s, path, name):
    """Return the one object called name, or None. The filter works for address, group and policy tables."""
    found = call(s, "GET", "/cmdb/" + path, params={"filter": "name==" + name})["results"]
    return found[0] if found else None


def norm(value):
    """FortiOS returns lists as [{"name": "web1", "q_origin_key": "web1"}]: compare plain names."""
    if isinstance(value, list):
        return [x["name"] if isinstance(x, dict) and "name" in x else x for x in value]
    return value


def differs(have, want):
    return {k: v for k, v in want.items() if norm(have.get(k)) != norm(v)}


def ensure(s, path, body):
    """Create the object when it is missing, update only what differs, else do nothing."""
    have = find(s, path, body["name"])
    if have is None:
        reply = call(s, "POST", "/cmdb/" + path, json=body)
        return "created", reply["mkey"]
    delta = differs(have, body)
    if not delta:
        return "unchanged", have["q_origin_key"]
    call(s, "PUT", "/cmdb/%s/%s" % (path, have["q_origin_key"]), json=delta)
    return "updated", have["q_origin_key"]</pre>
<p>Chaaron functions dekho:</p>
<ul>
<li><code>find()</code> <code>filter=name==...</code> se bilkul ek naam maangta hai aur object ya <code>None</code> lautata hai. Addresses, groups aur policies sab ke liye same kaam karta hai.</li>
<li><code>norm()</code> ek asli pareshani theek karta hai. Aap group member <code>[{"name": "web1"}]</code> bhejte ho, par FortiOS <code>[{"name": "web1", "q_origin_key": "web1"}]</code> lautata hai. Jaisa hai waisa compare karo to dono kabhi barabar nahi, aur script hamesha "update" karti rahegi. <code>norm()</code> dono ko <code>["web1"]</code> bana deta hai.</li>
<li><code>differs()</code> sirf wahi fields lautata hai jahan wanted value current se alag hai. Jin fields ka aapne zikr nahi kiya (jaise generated <code>uuid</code>) woh ignore hoti hain.</li>
<li><code>ensure()</code> inhe jodta hai. Create par reply se nayi key (<code>mkey</code>) lautata hai. Update par <b>sirf delta ka PUT</b> bhejta hai, isliye kisi aur ki set ki hui field overwrite nahi karta.</li>
</ul>

<h3>Change script</h3>
<p>CHG-3105 ke liye ticket do web servers aur ek group maangta hai. Data upar hai aur loop simple:</p>
<pre class="code">from fgt import ensure, session

ADDRESSES = [("web1", "10.20.0.10 255.255.255.255"), ("web2", "10.20.0.11 255.255.255.255")]

s = session()
for name, subnet in ADDRESSES:
    action, mkey = ensure(s, "firewall/address", {"name": name, "subnet": subnet, "comment": "CHG-3105"})
    print("address  %-12s %s" % (name, action))
group = {"name": "WEB-SERVERS", "member": [{"name": n} for n, _ in ADDRESSES], "comment": "CHG-3105"}
action, mkey = ensure(s, "firewall/addrgrp", group)
print("addrgrp  %-12s %s" % (group["name"], action))</pre>
<p>Do baar chalao. Doosri baar kuch nahi badalna chahiye:</p>
<pre class="out">AUTO01$ python3 objects.py
<span class="hl">address  web1         created</span>
<span class="hl">address  web2         created</span>
<span class="hl">addrgrp  WEB-SERVERS  created</span>
AUTO01$ python3 objects.py
<span class="hl">address  web1         unchanged</span>
<span class="hl">address  web2         unchanged</span>
<span class="hl">addrgrp  WEB-SERVERS  unchanged</span></pre>
<p>Result firewall par hi dekho, CLI mein jaise console dikhata hai:</p>
<pre class="out">FGT1 # show firewall address web2
config firewall address
    edit "web2"
        set uuid c7a76f7c-ea74-518e-ed2b-416c4d083808
<span class="hl">        set subnet 10.20.0.11 255.255.255.255</span>
<span class="hl">        set comment "CHG-3105"</span>
    next
end</pre>
<pre class="out">FGT1 # show firewall addrgrp
config firewall addrgrp
    edit "WEB-SERVERS"
        set uuid e272ff26-621a-51f8-a7ed-922220b0411e
<span class="hl">        set member "web1" "web2"</span>
        set comment "CHG-3105"
    next
end</pre>
<p>Comment <code>CHG-3105</code> har object ke saath chalta hai, isliye jo colleague chhe mahine baad <code>web2</code> dekhta hai use pata hai kaunsa ticket isse laya. Har object mein ticket number daalo.</p>

<h3>ensure() ke bina kya hota hai</h3>
<p>Maujood object ko seedha create karne se refusal milti hai. Firewall status ke saath <b>error number</b> bhi rakhta hai, aur wahi number padhna chahiye:</p>
<pre class="code">from fgt import FortiError, call, ensure, session

s = session()
try:
    call(s, "POST", "/cmdb/firewall/address", json={"name": "web1", "subnet": "10.20.0.10 255.255.255.255"})
except FortiError as err:
    print(err)
print(ensure(s, "firewall/address", {"name": "web2", "subnet": "10.20.0.12 255.255.255.255"}))
print(ensure(s, "firewall/address", {"name": "web2", "subnet": "10.20.0.12 255.255.255.255"}))
print(ensure(s, "firewall/address", {"name": "web2", "subnet": "10.20.0.11 255.255.255.255"}))</pre>
<pre class="out">AUTO01$ python3 dupe.py
<span class="hl">POST /cmdb/firewall/address -&gt; status 424, FortiOS error -5 The entry already exists.</span>
<span class="hl">('updated', 'web2')</span>
<span class="hl">('unchanged', 'web2')</span>
<span class="hl">('updated', 'web2')</span></pre>
<p>Pehli line raw refusal hai: status 424, FortiOS error -5, "The entry already exists." Phir <code>ensure()</code> <code>web2</code> ko naye subnet par badalta hai (<code>updated</code>), wahi value ke saath phir chalta hai (<code>unchanged</code>), aur original value wapas rakhta hai (<code>updated</code>). Yeh bilkul wahi drift repair hai jo aap chapter 9 mein use karoge.</p>

<h3>Wahi do calls curl mein</h3>
<p>Colleague ko sikhate waqt nangi calls ek baar dikhao. POST banata hai aur key lautata hai; DELETE hatata hai aur wahi envelope lautata hai:</p>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Bearer $FGT_TOKEN" -X POST -H "Content-Type: application/json" -d '{"name":"curl1","subnet":"10.20.0.30 255.255.255.255"}' h&#116;tps://10.99.0.41/api/v2/cmdb/firewall/address
{
  "http_method":"POST",
  "revision":"bcd5068fbdd50822bed509b5b7d4feb0",
<span class="hl">  "mkey":"curl1",</span>
  "vdom":"root",
  "path":"firewall",
  "name":"address",
<span class="hl">  "status":"success",</span>
  "http_status":200,
  "serial":"FGVMEV5I0AL40000",
  "version":"v7.4.4",
  "build":2662
}</pre>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Bearer $FGT_TOKEN" -X DELETE -w "\\n%{http_code}\\n" h&#116;tps://10.99.0.41/api/v2/cmdb/firewall/address/curl1
{
  "http_method":"DELETE",
  "revision":"2540dff32640e1862740e3192840e4ac",
<span class="hl">  "mkey":"curl1",</span>
  "vdom":"root",
  "path":"firewall",
  "name":"address",
  "status":"success",
<span class="hl">  "http_status":200,</span>
  "serial":"FGVMEV5I0AL40000",
  "version":"v7.4.4",
  "build":2662
}
<span class="hl">200</span></pre>
<div class="eg"><p><b>Worked example: adhoora change.</b> Engineer ticket script chalata hai. Group creation fail hoti hai kyunki kisi ne member ka naam galat type kiya. Do addresses ban chuke hain. Plain POST scripts mein re-run pehle address par fail hota hai ("already exists") aur group tak pahunchta hi nahi. <code>ensure()</code> ke saath re-run addresses ke liye <code>unchanged unchanged</code> batata hai aur group banata hai. Koi manual safai nahi, koi darr nahi.</p></div>

<div class="note"><p><b>Lab vs asli gear.</b> Lab mein maujood naam wala address sirf update raaste se jaata hai, jaisa upar. Asli FortiGate par yeh bhi dhyan rakho ki <b>address aur address group ek hi name space share karte hain</b>: agar address <code>web1</code> hai to <code>web1</code> naam ka group nahi bana sakte. Error number batata hai; message ka text firmware versions mein alag hota hai, isliye words par nahi, number ya HT&#84;P status par match karo.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Check kiye bina POST. Update mein poora object bhej dena (jo fields chhoona nahi chaahte unhe overwrite kar dete ho). Lists ko <code>norm()</code> ke bina compare karna. <code>/address/web2</code> (ek object) ki jagah <code>PUT /cmdb/firewall/address</code> (collection) use karna. Yeh bhoolna ki har write reply aate hi live ho jaati hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> FortiOS aur ASA REST mein <b>commit aur candidate configuration nahi hai</b>. Kaamyaab POST ya PUT already running config hai. NETCONF (candidate plus commit, <code>adv-netconf</code>) aur PAN-OS (candidate plus commit, agla module) se yahi bada contrast hai. Idempotence hi aapka akela safety net hai.</p></div>

<div class="scn"><h4>Do engineers, ek ticket</h4><p>Night shift mein do engineers ne CHG-3105 ki script kuch second ke gap se shuru ki. Purani script plain POST use karti thi: ek ko chhe "already exists" errors mile aur usne socha change fail hua, to usne "dobara try karne" ke liye objects delete karna shuru kar diya. Nayi version doosre engineer ko chhe baar <code>unchanged</code> print karti hai aur saaf exit hoti hai.</p><p><b>Lesson:</b> idempotent scripts khatarnak race ko harmless no-op bana deti hain. Isi wajah se timeout ke baad retry safe hai.</p></div>

<div class="iv"><p class="q">"Idempotent ka matlab kya hai, aur firewall change script ko idempotent kaise banate ho?"</p><p>Ek baar chalao ya kai baar, end state wahi. Main pehle object dhoondhta hoon, sirf tab banata hoon jab missing ho, maujood ho to sirf alag fields bhejta hoon, aur created, updated ya unchanged report karta hoon. Compare karne se pehle device ki lautai lists normalise karta hoon, aur objects par change number tag karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ensure() = find, phir missing ho to POST, alag ho to sirf delta ka PUT, warna kuch nahi.</li>
<li>created, updated, unchanged mein se ek report karo; achhi script ki doosri run har jagah unchanged kehti hai.</li>
<li>Compare se pehle lists normalise karo (name versus q_origin_key).</li>
<li>Duplicate POST FortiOS error -5 se refuse hota hai; text nahi, number padho.</li>
<li>FortiOS par REST writes turant live hain: commit nahi, rollback nahi.</li>
</ul></div>
`}};export{e as default};