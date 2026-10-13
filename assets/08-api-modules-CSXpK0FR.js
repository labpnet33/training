var e=String.raw`<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Three levels of pyeapi">
<rect x="20" y="14" width="600" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">node.api("vlans").create(110)</text><text x="320" y="51" text-anchor="middle" class="svg-muted" font-size="11">Python objects: get, create, set_name, True or False</text>
<rect x="20" y="72" width="600" height="46" rx="8" fill="#fde68a"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="13">node.config(["vlan 110", "name WEB"])</text><text x="320" y="109" text-anchor="middle" class="svg-muted" font-size="11">CLI lines in a configure request</text>
<rect x="20" y="130" width="600" height="46" rx="8" fill="#ddd6fe"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="13">node.run_commands([...])</text><text x="320" y="167" text-anchor="middle" class="svg-muted" font-size="11">any command, raw eAPI</text>
</svg></div>
<p class="cap">Three levels, same wire. Pick the highest one that does the job and drop down when it cannot.</p>`,t=String.raw`<pre class="code"><span class="c"># vlans.py (Lab 1, step 4) - safe to run twice</span>
WANT = {110: "WEB", 120: "APP", 130: "DB"}


def ensure_vlans(node, want):
    vlans = node.api("vlans")
    changed = []
    for vid, name in sorted(want.items()):
        have = vlans.get(str(vid))
        if have and have["name"] == name:
            continue
        if not (vlans.create(vid) and vlans.set_name(vid, name)):
            raise RuntimeError("EOS refused VLAN %d" % vid)
        changed.append(vid)
    return changed</pre>
<pre class="out">AUTO01$ python3 vlans.py
leaf1: 3 VLAN(s) changed [110, 120, 130]
leaf1 now: ['1', '110', '120', '130']
AUTO01$ python3 vlans.py
leaf1: <span class="hl">0 VLAN(s) changed []</span>
leaf1 now: ['1', '110', '120', '130']</pre>`,n=String.raw`<pre class="code"><span class="c"># d_apis.py - read, and one write, through the api modules</span>
import pyeapi

node = pyeapi.connect_to("leaf1")
print(node.api("vlans").get("110"))
print(node.api("system").get())
print(node.api("interfaces").get("Ethernet2"))
print(node.api("ipinterfaces").get("Ethernet2"))
print(node.api("interfaces").set_description("Ethernet2", "to-LEAF2-core"))
print(node.api("interfaces").get("Ethernet2")["description"])
print(node.api("users").getall().keys())
bgp = node.api("bgp").get()
print(bgp["bgp_as"], bgp["router_id"], sorted(bgp["neighbors"]))</pre>
<pre class="out">AUTO01$ python3 d_apis.py
{'vlan_id': '110', 'name': 'WEB', 'state': 'active', 'trunk_groups': []}
{'hostname': 'LEAF1', 'iprouting': True, 'banner_motd': None, 'banner_login': None}
{'name': 'Ethernet2', 'type': 'ethernet', 'shutdown': False, 'description': 'to-LEAF2', 'sflow': True, 'flowcontrol_send': 'off', 'flowcontrol_receive': 'off'}
{'name': 'Ethernet2', 'address': '10.1.2.1/30', 'mtu': 1500, 'helper_addresses': []}
<span class="hl">True</span>
to-LEAF2-core
dict_keys(['netops', 'viewer'])
65001 1.1.1.1 ['10.1.2.2']</pre>`,r=String.raw`<pre class="code"><span class="c"># bgpnbr.py (Lab 1, step 5)</span>
def ensure_neighbor(node):
    bgp = node.api("bgp")
    steps = []
    if bgp.get() is None:
        steps.append(bgp.create(LOCAL_AS))
    steps.append(bgp.set_router_id(ROUTER_ID))
    steps.append(bgp.add_network("1.1.1.1", 32))
    steps.append(bgp.neighbors.set_remote_as(PEER, PEER_AS))
    steps.append(bgp.neighbors.set_description(PEER, "LEAF2"))
    if not all(steps):
        raise RuntimeError("EOS refused a BGP command: %s" % steps)
    return bgp.get()["neighbors"][PEER]</pre>
<pre class="out">AUTO01$ python3 bgpnbr.py
configured: {'peer_group': None, 'remote_as': '65002', 'send_community': False, 'shutdown': False, 'description': 'LEAF2', 'next_hop_self': False, 'route_map_in': None, 'route_map_out': None}
The commands are accepted. The session needs a few seconds: check it with snapshot.py
AUTO01$ python3 snapshot.py
leaf1 {'vlans': ['1', '110', '120', '130'], 'peers': {'10.1.2.2': 'Established'}}
leaf2 {'vlans': ['1'], 'peers': {'10.1.2.1': 'Established'}}</pre>`,i={id:`api-modules`,h:{en:`The api modules: vlans, interfaces, bgp and friends`,hi:`Api modules: vlans, interfaces, bgp aur saathi`},body:{en:`
<p>Writing CLI lines works, but you still build the strings, parse the output and guess whether a change happened. pyeapi's <b>api modules</b> sit one level above: Python objects with methods such as <code>create</code> and <code>set_name</code>, and dictionaries with sensible keys. This chapter covers Lab 1 steps 4 and 5.</p>

<h3>Three levels, one wire</h3>
`+e+`
<p><code>node.api("name")</code> returns a module object for one feature. Typical members: <code>get(key)</code> for one item, <code>getall()</code> for a dictionary of all of them, and <code>create</code>, <code>delete</code>, <code>set_*</code> to change things. Under the hood each method sends CLI lines through the same <code>run_commands</code> you already know.</p>
<table class="cmp"><tr><th>Module</th><th>Manages</th><th>Example methods</th></tr>
<tr><td><code>vlans</code></td><td>VLAN database</td><td><code>get</code>, <code>getall</code>, <code>create</code>, <code>delete</code>, <code>set_name</code></td></tr>
<tr><td><code>interfaces</code></td><td>Any interface</td><td><code>get</code>, <code>set_description</code>, <code>set_shutdown</code></td></tr>
<tr><td><code>ipinterfaces</code></td><td>L3 addresses</td><td><code>get</code>, <code>set_address</code>, <code>set_mtu</code></td></tr>
<tr><td><code>switchports</code></td><td>L2 port mode and VLANs</td><td><code>get</code>, <code>set_access_vlan</code>, <code>set_trunk_allowed_vlans</code></td></tr>
<tr><td><code>system</code></td><td>Hostname, routing, banners</td><td><code>get</code>, <code>set_hostname</code></td></tr>
<tr><td><code>bgp</code> (with <code>.neighbors</code>)</td><td>BGP process and peers</td><td><code>create</code>, <code>set_router_id</code>, <code>add_network</code>, <code>neighbors.set_remote_as</code></td></tr>
<tr><td><code>ospf</code>, <code>mlag</code>, <code>users</code>, <code>varp</code>, <code>acl</code>, <code>routemaps</code></td><td>The matching features</td><td><code>get</code> and feature-specific setters</td></tr></table>

<h3>Reading</h3>
<p>The reads return plain dictionaries with stable keys, so you do not care how the CLI prints a column. Notice that a read of a missing item returns <code>None</code>; the code below relies on that.</p>
`+n+`
<p>Every write returns <code>True</code> or <code>False</code>. It does not raise when EOS refuses. Check the return value, always.</p>

<h3>Writing, idempotently</h3>
<p>Step 4 of the lab builds the tenant VLANs. The function compares what is there with what you want and touches only the difference. Run it twice: the second run changes nothing, which is what makes a script safe to schedule.</p>
`+t+`
<ul>
<li><code>vlans.get(str(vid))</code>: VLAN ids are strings in the API, as they were in the JSON.</li>
<li><code>if have and have["name"] == name</code>: skip what is already right.</li>
<li><code>create(vid) and set_name(vid, name)</code>: both must return <code>True</code>, otherwise raise. Silence on failure is the worst outcome.</li>
</ul>

<h3>BGP in four calls</h3>
<p>Step 5 makes LEAF1 peer with LEAF2. The module splits the work between the process (<code>bgp</code>) and its peers (<code>bgp.neighbors</code>). The script collects every return value in a list and raises if any is false.</p>
`+r+`
<p>Right after the script, the neighbor is configured but not yet up; BGP needs a few seconds. So the script says so, and the verification is a separate run of <code>snapshot.py</code>: both ends <code>Established</code>. Never print "success" from the setter's <code>True</code>; that only means the line was accepted.</p>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab implements the modules listed above for the cases in these labs. Some setters return <code>False</code> in the lab, for example <code>set_next_hop_self</code>, route-map attachment and <code>maximum_paths</code> on BGP, and many other real modules are absent. The real library has more modules and options. Always read a method's return value, and use <code>node.config()</code> or <code>run_commands</code> for anything an api module does not cover.</p></div>
<div class="warn"><p><b>Common mistake.</b> Calling <code>bgp.create(65001)</code> when BGP already exists with another AS. EOS accepts only one BGP process, and the call returns <code>False</code>. Read with <code>bgp.get()</code> first, as the script does.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>True</code> from a setter means "EOS accepted the command", not "the feature works". The BGP session, the VLAN on the trunk and the address on the wire still need a read-back.</p></div>

<div class="scn"><h4>The setter that said False</h4><p>A provisioning script called <code>set_description</code> on forty ports and ignored the return values. On four ports the interface name was written in lower case with a typo, so EOS refused and the call returned <code>False</code>. The labels were never set, and nobody noticed until the cabling audit.</p><p><b>Lesson:</b> collect the results, and fail loudly if any is false.</p></div>

<div class="iv"><p class="q">"When do you use the pyeapi api modules, and when run_commands?"</p><p>The api modules for common, well-defined objects (VLANs, interfaces, BGP neighbors): they give Python dictionaries, are idempotent when I compare first, and hide CLI syntax. <code>run_commands</code> for anything without a module, for show commands the modules do not wrap, and for exact CLI control. I always check the <code>True</code> or <code>False</code> a setter returns.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>node.api("vlans")</code> and friends return objects with <code>get</code>, <code>getall</code>, <code>create</code> and <code>set_*</code> methods.</li>
<li>Reads give dictionaries (string keys); a missing item gives <code>None</code>.</li>
<li>Writes return <code>True</code> or <code>False</code> and do not raise; check them.</li>
<li>Compare first and change only the difference, so a second run does nothing.</li>
<li><code>True</code> means accepted; verify the result with a read-back such as a BGP state.</li>
</ul></div>
`,hi:`
<p>CLI lines likhna chalta hai, par phir bhi aap strings banate ho, output parse karte ho aur andaza lagate ho ki change hua ya nahi. pyeapi ke <b>api modules</b> ek star upar hain: Python objects jinke methods <code>create</code> aur <code>set_name</code> jaise hain, aur samajhdaar keys wali dictionaries. Yeh chapter Lab 1 ke steps 4 aur 5 ko cover karta hai.</p>

<h3>Teen star, ek wire</h3>
`+e+`
<p><code>node.api("name")</code> ek feature ka module object lautata hai. Aam members: ek item ke liye <code>get(key)</code>, sabke dictionary ke liye <code>getall()</code>, aur badalne ke liye <code>create</code>, <code>delete</code>, <code>set_*</code>. Andar se har method wahi <code>run_commands</code> se CLI lines bhejta hai jo aap jaante ho.</p>
<table class="cmp"><tr><th>Module</th><th>Kya manage karta hai</th><th>Example methods</th></tr>
<tr><td><code>vlans</code></td><td>VLAN database</td><td><code>get</code>, <code>getall</code>, <code>create</code>, <code>delete</code>, <code>set_name</code></td></tr>
<tr><td><code>interfaces</code></td><td>Koi bhi interface</td><td><code>get</code>, <code>set_description</code>, <code>set_shutdown</code></td></tr>
<tr><td><code>ipinterfaces</code></td><td>L3 addresses</td><td><code>get</code>, <code>set_address</code>, <code>set_mtu</code></td></tr>
<tr><td><code>switchports</code></td><td>L2 port mode aur VLANs</td><td><code>get</code>, <code>set_access_vlan</code>, <code>set_trunk_allowed_vlans</code></td></tr>
<tr><td><code>system</code></td><td>Hostname, routing, banners</td><td><code>get</code>, <code>set_hostname</code></td></tr>
<tr><td><code>bgp</code> (<code>.neighbors</code> ke saath)</td><td>BGP process aur peers</td><td><code>create</code>, <code>set_router_id</code>, <code>add_network</code>, <code>neighbors.set_remote_as</code></td></tr>
<tr><td><code>ospf</code>, <code>mlag</code>, <code>users</code>, <code>varp</code>, <code>acl</code>, <code>routemaps</code></td><td>Unke features</td><td><code>get</code> aur feature ke setters</td></tr></table>

<h3>Padhna</h3>
<p>Reads simple dictionaries lautate hain jinki keys stable hain, isliye CLI column kaise print karta hai isse matlab nahi. Dhyan do: maujood na hone wale item ka read <code>None</code> deta hai; neeche ka code isi par tikka hai.</p>
`+n+`
<p>Har write <code>True</code> ya <code>False</code> lautata hai. EOS mana kare to raise nahi karta. Return value hamesha check karo.</p>

<h3>Likhna, idempotently</h3>
<p>Lab ka step 4 tenant VLANs banata hai. Function jo hai aur jo chahiye unhe compare karta hai aur sirf farq ko chhoota hai. Do baar chalao: doosri baar kuch nahi badalta, aur yahi script ko schedule karne layak banata hai.</p>
`+t+`
<ul>
<li><code>vlans.get(str(vid))</code>: API mein VLAN ids strings hain, jaise JSON mein the.</li>
<li><code>if have and have["name"] == name</code>: jo pehle se theek hai use chhodo.</li>
<li><code>create(vid) and set_name(vid, name)</code>: dono <code>True</code> hone chahiye, warna raise karo. Failure par chuppi sabse bura natija hai.</li>
</ul>

<h3>Chaar calls mein BGP</h3>
<p>Step 5 LEAF1 ko LEAF2 se peer karata hai. Module kaam process (<code>bgp</code>) aur uske peers (<code>bgp.neighbors</code>) mein baant deta hai. Script har return value list mein jama karti hai aur koi false ho to raise karti hai.</p>
`+r+`
<p>Script ke turant baad neighbor configured hai par up nahi; BGP ko kuch second chahiye. Isliye script yahi kehti hai, aur verification <code>snapshot.py</code> ka alag run hai: dono sire <code>Established</code>. Setter ke <code>True</code> se kabhi "success" print mat karo; woh sirf itna batata hai ki line accept hui.</p>
<div class="note"><p><b>Lab vs real gear.</b> Lab upar ke modules in labs ke cases ke liye implement karta hai. Kuch setters lab mein <code>False</code> lautate hain, jaise BGP par <code>set_next_hop_self</code>, route-map attachment aur <code>maximum_paths</code>, aur kai asli modules maujood nahi. Asli library mein zyada modules aur options hain. Method ki return value hamesha padho, aur jo api module cover na kare uske liye <code>node.config()</code> ya <code>run_commands</code> use karo.</p></div>
<div class="warn"><p><b>Common mistake.</b> BGP kisi aur AS ke saath pehle se ho aur <code>bgp.create(65001)</code> bulana. EOS sirf ek BGP process leta hai, aur call <code>False</code> lautati hai. Pehle <code>bgp.get()</code> se padho, jaise script karti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Setter ka <code>True</code> matlab "EOS ne command accept kiya", "feature chal raha hai" nahi. BGP session, trunk par VLAN aur wire par address ko phir bhi read-back chahiye.</p></div>

<div class="scn"><h4>Jis setter ne False kaha</h4><p>Ek provisioning script ne chalis ports par <code>set_description</code> bulaya aur return values ignore kin. Chaar ports par interface ka naam lower case aur typo ke saath tha, isliye EOS ne mana kiya aur call ne <code>False</code> lautaya. Labels kabhi set nahi hue, aur cabling audit tak kisi ko pata nahi chala.</p><p><b>Lesson:</b> results jama karo, aur koi false ho to zor se fail karo.</p></div>

<div class="iv"><p class="q">"pyeapi api modules kab, aur run_commands kab?"</p><p>Aam, achhi tarah define objects (VLANs, interfaces, BGP neighbors) ke liye api modules: Python dictionaries dete hain, pehle compare karun to idempotent, aur CLI syntax chhupate hain. <code>run_commands</code> unke liye jinka module nahi, jin show commands ko modules wrap nahi karte, aur exact CLI control ke liye. Setter ka lautaya <code>True</code> ya <code>False</code> hamesha check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>node.api("vlans")</code> aur saathi <code>get</code>, <code>getall</code>, <code>create</code> aur <code>set_*</code> wale objects lautate hain.</li>
<li>Reads dictionaries deta hain (string keys); maujood na item par <code>None</code>.</li>
<li>Writes <code>True</code> ya <code>False</code> lautate hain aur raise nahi karte; check karo.</li>
<li>Pehle compare karo aur sirf farq badlo, taaki doosri run kuch na kare.</li>
<li><code>True</code> matlab accepted; result BGP state jaise read-back se verify karo.</li>
</ul></div>
`}};export{i as default};