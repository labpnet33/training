var e={id:`paths-encodings`,h:{en:`OpenConfig paths, origins and encodings`,hi:`OpenConfig paths, origins aur encodings`},body:{en:`
<p>A gNMI request is mostly an address. If you can read and write the address correctly, the rest of the module is easy. Think of a filing cabinet: the model is the cabinet layout, the path is "drawer, folder, page", and the encoding is the paper you write the answer on.</p>

<h3>Anatomy of a path</h3>
<p>A YANG model is a tree. A <b>path</b> walks down it, one element per level, separated by slashes. A <b>list</b> (like the interface list) has a <b>key</b>, written in square brackets, to choose one entry.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Path split into container, list with key, container and leaf">
<rect x="20" y="30" width="110" height="44" rx="8" fill="#bae6fd"/><text x="75" y="57" text-anchor="middle" class="svg-ink" font-size="12">interfaces</text>
<rect x="140" y="30" width="200" height="44" rx="8" fill="#ddd6fe"/><text x="240" y="57" text-anchor="middle" class="svg-ink" font-size="12">interface[name=Ethernet1]</text>
<rect x="350" y="30" width="80" height="44" rx="8" fill="#fde68a"/><text x="390" y="57" text-anchor="middle" class="svg-ink" font-size="12">state</text>
<rect x="440" y="30" width="90" height="44" rx="8" fill="#bbf7d0"/><text x="485" y="57" text-anchor="middle" class="svg-ink" font-size="12">counters</text>
<rect x="540" y="30" width="90" height="44" rx="8" fill="#fed7aa"/><text x="585" y="57" text-anchor="middle" class="svg-ink" font-size="12">in-octets</text>
<text x="75" y="100" text-anchor="middle" class="svg-muted" font-size="11">container</text><text x="240" y="100" text-anchor="middle" class="svg-muted" font-size="11">list + key</text><text x="390" y="100" text-anchor="middle" class="svg-muted" font-size="11">container</text><text x="485" y="100" text-anchor="middle" class="svg-muted" font-size="11">container</text><text x="585" y="100" text-anchor="middle" class="svg-muted" font-size="11">leaf</text>
</svg><p class="cap">/interfaces/interface[name=Ethernet1]/state/counters/in-octets</p></div>
<p>OpenConfig splits most things in two. Under <code>config</code> lives what you asked for (the intent: description, enabled, mtu). Under <code>state</code> lives what the device is doing (oper-status, counters). You Set config. You Get or Subscribe to state.</p>
<ul>
<li><b>Key wildcard:</b> <code>[name=*]</code> matches every interface.</li>
<li><b>Recursive wildcard:</b> <code>...</code> matches everything below that point. It can be large.</li>
<li><b>Origin:</b> a prefix such as <code>openconfig:</code> names the model family. Other origins exist, for example a vendor-native tree or <code>cli</code>. Without one, the device assumes OpenConfig.</li>
<li><b>Prefix:</b> the <code>prefix=</code> argument holds the common start of several paths, so you write it once.</li>
</ul>
<p>Paths are case sensitive and keys must match exactly. In pygnmi, <code>path</code> is always a <b>list</b> of strings, even for one path. The script below tries eight spellings:</p>
<pre class="code">from pygnmi.client import gNMIclient, gNMIException

TRIES = [
    ("plain path", dict(path=["/interfaces/interface[name=Ethernet1]/state/oper-status"])),
    ("no leading slash", dict(path=["interfaces/interface[name=Ethernet1]/state/oper-status"])),
    ("with origin", dict(path=["openconfig:/interfaces/interface[name=Ethernet1]/state/oper-status"])),
    ("wildcard key", dict(path=["/interfaces/interface[name=*]/state/oper-status"])),
    ("prefix + paths", dict(prefix="/interfaces/interface[name=Ethernet1]", path=["state/oper-status", "state/admin-status"])),
    ("wrong case", dict(path=["/Interfaces/interface[name=Ethernet1]/state/oper-status"])),
    ("missing key", dict(path=["/interfaces/interface[name=Eth1]/state/oper-status"])),
    ("string, not list", dict(path="/system/state/hostname")),
]
with gNMIclient(target=("10.99.0.11", 6030), username="netops", password="NK@2026", insecure=True) as gc:
    for label, kw in TRIES:
        try:
            res = gc.get(**kw)
            n = res["notification"][0]
            total = sum(len(x["update"]) for x in res["notification"])
            print(f"{label:&lt;17} prefix={n.get('prefix', '-')}  leaves={total}  first={n['update'][0]['path']}")
        except gNMIException as err:
            print(f"{label:&lt;17} ERR {err}")</pre>
<pre class="out">AUTO01$ python3 d_path.py
plain path        prefix=-  leaves=1  first=interfaces/interface[name=Ethernet1]/state/oper-status
no leading slash  prefix=-  leaves=1  first=interfaces/interface[name=Ethernet1]/state/oper-status
with origin       prefix=-  leaves=1  first=interfaces/interface[name=Ethernet1]/state/oper-status
<span class="hl">wildcard key      prefix=-  leaves=9  first=interfaces/interface[name=Ethernet1]/state/oper-status</span>
prefix + paths    prefix=interfaces/interface[name=Ethernet1]  leaves=2  first=state/oper-status
<span class="hl">wrong case        ERR gNMI Error: &lt;StatusCode.NOT_FOUND: (5, 'not found')&gt; Unable to find the path /Interfaces/interface[name=Ethernet1]/state/oper-status</span>
<span class="hl">missing key       ERR gNMI Error: &lt;StatusCode.NOT_FOUND: (5, 'not found')&gt; Unable to find the path /interfaces/interface[name=Eth1]/state/oper-status</span>
<span class="hl">string, not list  ERR The path must be a list of strings, for example path=["/interfaces/interface[name=Ethernet1]/state"]</span></pre>
<p>Look at what comes back. The reply path has no leading slash. The origin spelling returns the same leaf. The wildcard returned 9 leaves, one per interface. The prefix form returned two leaves and kept the prefix separate. A wrong letter case or a missing key gives NOT_FOUND, and a bare string is refused before anything is sent.</p>

<h3>Encodings</h3>
<p>The <b>encoding</b> is how the value is written on the wire. You ask with <code>encoding=</code> and the device must support it. First learn what it supports, with <code>capabilities()</code> (next chapter).</p>
<table class="cmp"><tr><th>Encoding</th><th>What it is</th><th>EOS</th><th>IOS XE</th><th>Junos</th></tr>
<tr><td>json</td><td>Plain JSON text</td><td>yes</td><td>no</td><td>yes</td></tr>
<tr><td>json_ietf</td><td>JSON following RFC 7951 naming rules</td><td>yes</td><td>yes</td><td>yes</td></tr>
<tr><td>proto</td><td>Typed protobuf values, compact</td><td>no</td><td>yes</td><td>yes</td></tr>
<tr><td>ascii</td><td>Text, such as CLI output</td><td>yes (origin cli)</td><td>no</td><td>no</td></tr></table>
<pre class="code">from pygnmi.client import gNMIclient, gNMIException

TARGETS = [("LEAF1", 6030, "insecure"), ("XE1", 50052, "insecure")]
for name, port, _ in TARGETS:
    host = "10.99.0.11" if name == "LEAF1" else "10.99.0.1"
    with gNMIclient(target=(host, port), username="netops", password="NK@2026", insecure=True) as gc:
        print(name, gc.capabilities()["supported_encodings"])
        for enc in ("json", "json_ietf", "ascii", "proto"):
            try:
                res = gc.get(path=["/system/state/hostname"], encoding=enc)
                print(" ", enc, "-&gt;", res["notification"][0]["update"][0]["val"])
            except gNMIException as err:
                print(" ", enc, "-&gt;", err)</pre>
<pre class="out">AUTO01$ python3 d_enc.py
LEAF1 ['json', 'json_ietf', 'ascii']
  json -&gt; LEAF1
  json_ietf -&gt; LEAF1
<span class="hl">  ascii -&gt; gNMI Error: &lt;StatusCode.INVALID_ARGUMENT: (3, 'invalid argument')&gt; ASCII encoding is only supported with origin "cli"</span>
<span class="hl">  proto -&gt; gNMI Error: &lt;StatusCode.INVALID_ARGUMENT: (3, 'invalid argument')&gt; Unsupported encoding PROTO for Get; supported encodings: JSON, JSON_IETF, ASCII</span>
XE1 ['json_ietf', 'proto']
<span class="hl">  json -&gt; gNMI Error: &lt;StatusCode.INVALID_ARGUMENT: (3, 'invalid argument')&gt; Unsupported encoding JSON for Get; supported encodings: JSON_IETF, PROTO</span>
  json_ietf -&gt; XE1
<span class="hl">  ascii -&gt; gNMI Error: &lt;StatusCode.INVALID_ARGUMENT: (3, 'invalid argument')&gt; Unsupported encoding ASCII for Get; supported encodings: JSON_IETF, PROTO</span>
  proto -&gt; XE1</pre>
<p>The pygnmi default is <code>encoding="json"</code>. That works on EOS and Junos but fails on IOS XE, which wants <code>json_ietf</code> or <code>proto</code>. The safest habit is to read the first entry of <code>supported_encodings</code> and use it.</p>

<div class="warn"><p><b>Common mistake.</b> Passing <code>path="/system/state/hostname"</code> instead of a list. Also copying a path from a CLI habit: gNMI paths use the model names, not CLI words.</p></div>
<div class="exam"><p><b>Exam trap.</b> Config and state are different subtrees. Writing to a <code>state</code> leaf is refused. Subscribing ON_CHANGE to counters is also refused, because counters change every packet.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab prints a plain integer for every counter whatever the encoding. On a real device JSON_IETF may print 64-bit counters as strings, so convert with <code>int()</code> in code that must run in both.</p></div>

<div class="scn"><h4>The capital I</h4><p>A new script returned NOT_FOUND on every switch. The author had typed <code>/Interfaces/interface</code>. The model names are lower case. One letter, fifty failed calls.</p><p><b>Lesson:</b> when you see NOT_FOUND, compare the path to the model, character by character.</p></div>
<div class="iv"><p class="q">"What is the difference between config and state in OpenConfig?"</p><p>Config is the intended setting you can write. State is the operational reality you can only read, and it also repeats the config values so one read gives intent and result side by side.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A path is container / list[key=value] / leaf, case sensitive.</li>
<li>Use <code>*</code> for all keys and <code>...</code> for everything below.</li>
<li>pygnmi wants a list of path strings.</li>
<li>Encodings differ per vendor: json, json_ietf, proto, ascii.</li>
<li>Config is writable, state is read only.</li></ul></div>
`,hi:`
<p>Ek gNMI request zyadatar ek address hota hai. Agar aap address sahi padh aur likh lete ho, to baaki module aasan hai. Filing cabinet socho: model cabinet ka layout hai, path "drawer, folder, page" hai, aur encoding woh kaagaz hai jis par jawab likha jaata hai.</p>

<h3>Path ki banawat</h3>
<p>YANG model ek tree hai. <b>Path</b> uske neeche chalta hai, har level par ek element, slash se alag. <b>List</b> (jaise interface list) mein ek <b>key</b> hoti hai, square brackets mein likhi, jo ek entry chunti hai.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Path container, key wali list, container aur leaf mein bata hua">
<rect x="20" y="30" width="110" height="44" rx="8" fill="#bae6fd"/><text x="75" y="57" text-anchor="middle" class="svg-ink" font-size="12">interfaces</text>
<rect x="140" y="30" width="200" height="44" rx="8" fill="#ddd6fe"/><text x="240" y="57" text-anchor="middle" class="svg-ink" font-size="12">interface[name=Ethernet1]</text>
<rect x="350" y="30" width="80" height="44" rx="8" fill="#fde68a"/><text x="390" y="57" text-anchor="middle" class="svg-ink" font-size="12">state</text>
<rect x="440" y="30" width="90" height="44" rx="8" fill="#bbf7d0"/><text x="485" y="57" text-anchor="middle" class="svg-ink" font-size="12">counters</text>
<rect x="540" y="30" width="90" height="44" rx="8" fill="#fed7aa"/><text x="585" y="57" text-anchor="middle" class="svg-ink" font-size="12">in-octets</text>
<text x="75" y="100" text-anchor="middle" class="svg-muted" font-size="11">container</text><text x="240" y="100" text-anchor="middle" class="svg-muted" font-size="11">list + key</text><text x="390" y="100" text-anchor="middle" class="svg-muted" font-size="11">container</text><text x="485" y="100" text-anchor="middle" class="svg-muted" font-size="11">container</text><text x="585" y="100" text-anchor="middle" class="svg-muted" font-size="11">leaf</text>
</svg><p class="cap">/interfaces/interface[name=Ethernet1]/state/counters/in-octets</p></div>
<p>OpenConfig zyadatar cheezein do hisson mein baantta hai. <code>config</code> ke neeche woh hai jo aapne maanga (intent: description, enabled, mtu). <code>state</code> ke neeche woh hai jo device kar raha hai (oper-status, counters). Config ko aap Set karte ho. State ko Get ya Subscribe karte ho.</p>
<ul>
<li><b>Key wildcard:</b> <code>[name=*]</code> har interface se match karta hai.</li>
<li><b>Recursive wildcard:</b> <code>...</code> us point ke neeche sab kuch match karta hai. Yeh bada ho sakta hai.</li>
<li><b>Origin:</b> <code>openconfig:</code> jaisa prefix model family ka naam batata hai. Doosre origins bhi hain, jaise vendor-native tree ya <code>cli</code>. Origin na ho to device OpenConfig maan leta hai.</li>
<li><b>Prefix:</b> <code>prefix=</code> argument kai paths ki common shuruaat rakhta hai, taaki use ek baar likhna pade.</li>
</ul>
<p>Paths case sensitive hote hain aur keys bilkul match karni chahiye. pygnmi mein <code>path</code> hamesha strings ki <b>list</b> hota hai, ek path ho tab bhi. Neeche ki script aath spellings try karti hai:</p>
<pre class="code">from pygnmi.client import gNMIclient, gNMIException

TRIES = [
    ("plain path", dict(path=["/interfaces/interface[name=Ethernet1]/state/oper-status"])),
    ("no leading slash", dict(path=["interfaces/interface[name=Ethernet1]/state/oper-status"])),
    ("with origin", dict(path=["openconfig:/interfaces/interface[name=Ethernet1]/state/oper-status"])),
    ("wildcard key", dict(path=["/interfaces/interface[name=*]/state/oper-status"])),
    ("prefix + paths", dict(prefix="/interfaces/interface[name=Ethernet1]", path=["state/oper-status", "state/admin-status"])),
    ("wrong case", dict(path=["/Interfaces/interface[name=Ethernet1]/state/oper-status"])),
    ("missing key", dict(path=["/interfaces/interface[name=Eth1]/state/oper-status"])),
    ("string, not list", dict(path="/system/state/hostname")),
]
with gNMIclient(target=("10.99.0.11", 6030), username="netops", password="NK@2026", insecure=True) as gc:
    for label, kw in TRIES:
        try:
            res = gc.get(**kw)
            n = res["notification"][0]
            total = sum(len(x["update"]) for x in res["notification"])
            print(f"{label:&lt;17} prefix={n.get('prefix', '-')}  leaves={total}  first={n['update'][0]['path']}")
        except gNMIException as err:
            print(f"{label:&lt;17} ERR {err}")</pre>
<pre class="out">AUTO01$ python3 d_path.py
plain path        prefix=-  leaves=1  first=interfaces/interface[name=Ethernet1]/state/oper-status
no leading slash  prefix=-  leaves=1  first=interfaces/interface[name=Ethernet1]/state/oper-status
with origin       prefix=-  leaves=1  first=interfaces/interface[name=Ethernet1]/state/oper-status
<span class="hl">wildcard key      prefix=-  leaves=9  first=interfaces/interface[name=Ethernet1]/state/oper-status</span>
prefix + paths    prefix=interfaces/interface[name=Ethernet1]  leaves=2  first=state/oper-status
<span class="hl">wrong case        ERR gNMI Error: &lt;StatusCode.NOT_FOUND: (5, 'not found')&gt; Unable to find the path /Interfaces/interface[name=Ethernet1]/state/oper-status</span>
<span class="hl">missing key       ERR gNMI Error: &lt;StatusCode.NOT_FOUND: (5, 'not found')&gt; Unable to find the path /interfaces/interface[name=Eth1]/state/oper-status</span>
<span class="hl">string, not list  ERR The path must be a list of strings, for example path=["/interfaces/interface[name=Ethernet1]/state"]</span></pre>
<p>Dekho kya wapas aaya. Reply path mein leading slash nahi hai. Origin wali spelling wahi leaf deti hai. Wildcard ne 9 leaves diye, har interface ka ek. Prefix wale form ne do leaves diye aur prefix ko alag rakha. Galat letter case ya missing key NOT_FOUND deti hai, aur bare string kuch bheje jaane se pehle hi refuse ho jaati hai.</p>

<h3>Encodings</h3>
<p><b>Encoding</b> woh tareeka hai jisme value wire par likhi jaati hai. Aap <code>encoding=</code> se maangte ho aur device ko use support karna chahiye. Pehle <code>capabilities()</code> se pata karo ki woh kya support karta hai (agla chapter).</p>
<table class="cmp"><tr><th>Encoding</th><th>Kya hai</th><th>EOS</th><th>IOS XE</th><th>Junos</th></tr>
<tr><td>json</td><td>Seedha JSON text</td><td>haan</td><td>nahi</td><td>haan</td></tr>
<tr><td>json_ietf</td><td>RFC 7951 naming rules wala JSON</td><td>haan</td><td>haan</td><td>haan</td></tr>
<tr><td>proto</td><td>Typed protobuf values, compact</td><td>nahi</td><td>haan</td><td>haan</td></tr>
<tr><td>ascii</td><td>Text, jaise CLI output</td><td>haan (origin cli)</td><td>nahi</td><td>nahi</td></tr></table>
<pre class="code">from pygnmi.client import gNMIclient, gNMIException

TARGETS = [("LEAF1", 6030, "insecure"), ("XE1", 50052, "insecure")]
for name, port, _ in TARGETS:
    host = "10.99.0.11" if name == "LEAF1" else "10.99.0.1"
    with gNMIclient(target=(host, port), username="netops", password="NK@2026", insecure=True) as gc:
        print(name, gc.capabilities()["supported_encodings"])
        for enc in ("json", "json_ietf", "ascii", "proto"):
            try:
                res = gc.get(path=["/system/state/hostname"], encoding=enc)
                print(" ", enc, "-&gt;", res["notification"][0]["update"][0]["val"])
            except gNMIException as err:
                print(" ", enc, "-&gt;", err)</pre>
<pre class="out">AUTO01$ python3 d_enc.py
LEAF1 ['json', 'json_ietf', 'ascii']
  json -&gt; LEAF1
  json_ietf -&gt; LEAF1
<span class="hl">  ascii -&gt; gNMI Error: &lt;StatusCode.INVALID_ARGUMENT: (3, 'invalid argument')&gt; ASCII encoding is only supported with origin "cli"</span>
<span class="hl">  proto -&gt; gNMI Error: &lt;StatusCode.INVALID_ARGUMENT: (3, 'invalid argument')&gt; Unsupported encoding PROTO for Get; supported encodings: JSON, JSON_IETF, ASCII</span>
XE1 ['json_ietf', 'proto']
<span class="hl">  json -&gt; gNMI Error: &lt;StatusCode.INVALID_ARGUMENT: (3, 'invalid argument')&gt; Unsupported encoding JSON for Get; supported encodings: JSON_IETF, PROTO</span>
  json_ietf -&gt; XE1
<span class="hl">  ascii -&gt; gNMI Error: &lt;StatusCode.INVALID_ARGUMENT: (3, 'invalid argument')&gt; Unsupported encoding ASCII for Get; supported encodings: JSON_IETF, PROTO</span>
  proto -&gt; XE1</pre>
<p>pygnmi ka default <code>encoding="json"</code> hai. Yeh EOS aur Junos par chalta hai par IOS XE par fail hota hai, jise <code>json_ietf</code> ya <code>proto</code> chahiye. Sabse surakshit aadat: <code>supported_encodings</code> ki pehli entry padho aur wahi use karo.</p>

<div class="warn"><p><b>Aam galti.</b> <code>path="/system/state/hostname"</code> dena list ki jagah. Aur CLI ki aadat se path copy karna: gNMI paths model ke naam use karte hain, CLI ke shabd nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Config aur state alag subtrees hain. <code>state</code> leaf par likhna refuse hota hai. Counters par ON_CHANGE subscribe karna bhi refuse hota hai, kyunki counters har packet par badalte hain.</p></div>
<div class="note"><p><b>Lab vs asli gear.</b> Lab har counter ko encoding chahe jo ho seedha integer print karta hai. Asli device par JSON_IETF 64-bit counters ko strings ki tarah print kar sakta hai, isliye jo code dono jagah chalna chahiye usme <code>int()</code> lagao.</p></div>

<div class="scn"><h4>Capital I</h4><p>Ek nayi script har switch par NOT_FOUND deti thi. Author ne <code>/Interfaces/interface</code> type kiya tha. Model ke naam lower case mein hain. Ek akshar, pachaas failed calls.</p><p><b>Lesson:</b> NOT_FOUND dikhe to path ko model se akshar-akshar milao.</p></div>
<div class="iv"><p class="q">"OpenConfig mein config aur state mein kya fark hai?"</p><p>Config woh intended setting hai jo aap likh sakte ho. State operational sachchai hai jo sirf padh sakte ho, aur woh config values bhi dohrati hai, isliye ek read mein intent aur result saath dikhte hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Path = container / list[key=value] / leaf, case sensitive.</li>
<li>Sab keys ke liye <code>*</code>, neeche sab kuch ke liye <code>...</code>.</li>
<li>pygnmi path strings ki list maangta hai.</li>
<li>Encodings vendor ke hisaab se alag: json, json_ietf, proto, ascii.</li>
<li>Config likh sakte ho, state sirf padh sakte ho.</li></ul></div>
`}};export{e as default};