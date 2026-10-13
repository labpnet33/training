var e={id:`getters`,h:{en:`Getters: ask any vendor the same question`,hi:`Getters: kisi bhi vendor se wahi sawaal poochho`},body:{en:`<p>A getter is a method whose name starts with <code>get_</code>. You call it, and the driver runs whatever show commands or API calls its platform needs, parses the answer and returns a plain Python dictionary or list with <b>the same keys on every vendor</b>. This is the part of NAPALM that people use first, and it pays back at once: one loop, one shape of data.</p>

<h3>An analogy: the same gauges in every car</h3>
<p>A Toyota, a Tesla and a Tata have different engines, but each dashboard has a speedometer and a fuel or battery gauge in a place you understand. Getters are the dashboard. <code>get_facts()</code> is the identity plate; <code>get_interfaces()</code> is the list of ports and whether each is up; <code>get_bgp_neighbors()</code> is the peering panel.</p>

<h3>The getters you will use every week</h3>
<table class="cmp"><tr><th>Getter</th><th>ios</th><th>eos</th><th>junos</th><th>nxos_ssh</th></tr>
<tr><td><code>get_facts</code></td><td>yes</td><td>yes</td><td>yes</td><td>yes</td></tr>
<tr><td><code>get_interfaces</code></td><td>yes</td><td>yes</td><td>yes (physical)</td><td>yes</td></tr>
<tr><td><code>get_interfaces_ip</code></td><td>yes</td><td>yes</td><td>yes (logical names)</td><td>yes</td></tr>
<tr><td><code>get_ntp_servers</code></td><td>yes</td><td>yes</td><td>yes</td><td>yes</td></tr>
<tr><td><code>get_bgp_neighbors</code></td><td>yes</td><td>yes</td><td>yes</td><td>yes</td></tr>
<tr><td><code>get_arp_table</code></td><td>yes</td><td>yes</td><td>yes</td><td>yes</td></tr>
<tr><td><code>get_users</code></td><td>yes</td><td>yes</td><td>yes</td><td>yes</td></tr>
<tr><td><code>get_vlans</code></td><td>yes</td><td>yes</td><td>no</td><td>yes</td></tr>
<tr><td><code>get_mac_address_table</code></td><td>yes</td><td>yes</td><td>no</td><td>yes</td></tr>
<tr><td><code>get_snmp_information</code></td><td>yes</td><td>yes</td><td>no</td><td>yes</td></tr>
<tr><td><code>get_bgp_neighbors_detail</code></td><td>yes</td><td>no</td><td>no</td><td>yes</td></tr></table>
<p>This table is what the lab drivers implement. A getter a driver does not have raises <code>NotImplementedError</code> with an <b>empty message</b>. Others, such as <code>get_optics</code> and <code>get_firewall_policies</code>, are missing everywhere in the lab.</p>

<h3>Facts on three vendors</h3>
<p><code>get_facts()</code> returns exactly these keys: <code>hostname</code>, <code>fqdn</code>, <code>vendor</code>, <code>model</code>, <code>serial_number</code>, <code>os_version</code>, <code>uptime</code> and <code>interface_list</code>. Lab 1, step 1, prints some of them for every device.</p>
<pre class="code">from nkdev import DEVICES, open_device

for name in DEVICES:
    dev = open_device(name)
    f = dev.get_facts()
    print("%-3s %-12s %-8s %-9s %2d interfaces" % (name, f["hostname"], f["vendor"], f["model"], len(f["interface_list"])))
    dev.close()</pre>
<pre class="out">AUTO01$ python3 facts.py
R1  PUN-CORE-R1  Cisco    ISR4331    5 interfaces
J1  J1           Juniper  VMX       16 interfaces
E1  E1           Arista   <span class="hl">vEOS-lab</span>   9 interfaces</pre>
<p>The vendor name is spelled the way NAPALM spells it (<code>Cisco</code>, <code>Juniper</code>, <code>Arista</code>), so you can group by it. Never use <code>uptime</code> or <code>serial_number</code> in a comparison between runs: uptime changes every second.</p>

<h3>The shape of interfaces, addresses and BGP</h3>
<p>Interface getters return a dictionary keyed by interface name. Each entry has the same fields, but the <em>values</em> still show vendor habits:</p>
<pre class="code">import json

from nkdev import open_device

for name, ifname in (("R1", "GigabitEthernet0/0"), ("J1", "ge-0/0/0"), ("E1", "Ethernet1")):
    dev = open_device(name)
    info = dev.get_interfaces()[ifname]
    print(name, ifname, json.dumps({k: info[k] for k in ("is_up", "is_enabled", "speed", "mtu")}))
    print("   ip:", json.dumps(dev.get_interfaces_ip().get(ifname) or dev.get_interfaces_ip().get(ifname + ".0")))
    print("   bgp vrf names:", list(dev.get_bgp_neighbors()))
    dev.close()</pre>
<pre class="out">AUTO01$ python3 shape.py
R1 GigabitEthernet0/0 {"is_up": true, "is_enabled": true, "speed": 1000, "mtu": 1500}
   ip: {"ipv4": {"10.99.0.1": {"prefix_length": 24}}}
   bgp vrf names: ['global']
J1 ge-0/0/0 {"is_up": true, "is_enabled": true, "speed": 1000, "mtu": <span class="hl">1514</span>}
   ip: {"ipv4": {"10.99.0.11": {"prefix_length": 24}}}
   bgp vrf names: ['global']
E1 Ethernet1 {"is_up": true, "is_enabled": true, "speed": <span class="hl">1000.0</span>, "mtu": 1500}
   ip: {"ipv4": {"10.99.0.21": {"prefix_length": 24}}}
   bgp vrf names: ['global']</pre>
<ul>
<li><b>speed</b> is a number in Mbps. EOS gives a float (<code>1000.0</code>), the others an int. Compare with <code>==</code>, which treats both as equal, and do not print them as text if you want identical output.</li>
<li><b>mtu</b> is what the platform reports: Junos counts its 14-byte Ethernet header (<code>1514</code>), so the same link can look different.</li>
<li><b>Junos interface names</b> in <code>get_interfaces_ip()</code> are logical units, <code>ge-0/0/0.0</code>, while <code>get_interfaces()</code> uses the physical name. The script looks the address up with both.</li>
<li><b>BGP</b> returns <code>{vrf: {"router_id": ..., "peers": {ip: {...}}}}</code>. The default routing instance is called <code>global</code> on all three, even though Junos calls it <code>master</code> and IOS has no name for it. That is a gift when you write a loop.</li></ul>

<h3>Many getters in one script</h3>
<p>Lab 1, step 2: for every device print NTP servers and BGP peers, then try a getter that Junos does not have.</p>
<pre class="code">from nkdev import DEVICES, open_device

for name in DEVICES:
    dev = open_device(name)
    print("%s ntp  %s" % (name, sorted(dev.get_ntp_servers())))
    peers = dev.get_bgp_neighbors()["global"]["peers"]
    print("%s bgp  %s" % (name, ["%s as%s %s" % (ip, p["remote_as"], "up" if p["is_up"] else "down") for ip, p in sorted(peers.items())]))
    try:
        print("%s vlans %s" % (name, sorted(dev.get_vlans())))
    except NotImplementedError as err:
        print("%s get_vlans: %s %r" % (name, type(err).__name__, str(err)))
    dev.close()</pre>
<pre class="out">AUTO01$ python3 getters.py
R1 ntp  ['10.99.0.60']
R1 bgp  ['10.99.0.11 as65002 up', '10.99.0.21 as65003 up']
R1 vlans []
J1 ntp  ['10.99.0.60']
J1 bgp  ['10.99.0.1 as65001 up']
<span class="hl">J1 get_vlans: NotImplementedError ''</span>
E1 ntp  ['10.99.0.60']
E1 bgp  ['10.99.0.1 as65001 up']
E1 vlans [1]</pre>
<p>The last line is the pattern to remember. <code>NotImplementedError</code> is a normal Python exception, caught per getter, and it tells you "this driver cannot answer", which is different from "the answer is empty" (R1 printed <code>[]</code>, a real empty list).</p>

<div class="note"><p><b>In the lab vs on real gear.</b> The lab drivers read the simulator's show output, so anything the simulator prints differently shows up differently: LLDP neighbours are empty, the environment getter has no sensors, <code>uptime</code> follows the simulator clock, and J1 has no switching, so <code>get_vlans</code> is not implemented on it. On real hardware check the NAPALM support matrix for your driver version before you rely on a getter.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Indexing a missing key (<code>peers["10.1.1.1"]</code>) instead of using <code>.get()</code>; assuming a getter exists on every driver; comparing <code>uptime</code>; treating <code>NotImplementedError</code> as a bug in your script rather than a property of the driver.</p></div>

<div class="exam"><p><b>Exam trap.</b> A getter returns data; it never changes the device. The name of the default BGP instance in the result is <code>global</code>.</p></div>

<div class="scn"><h4>The upgrade that moved a column</h4><p>A bank's audit script split <code>show ip bgp summary</code> on spaces. After an upgrade a column widened and every Junos row shifted by one. The replacement used <code>get_bgp_neighbors()</code>; the driver's maintainers fixed the parser once for everyone, and the audit code did not change.</p><p><b>Lesson:</b> getters move the parsing risk from your script to a maintained driver.</p></div>

<div class="iv"><p class="q">"What does get_facts return, and what is it good for?"</p><p>A dictionary with hostname, fqdn, vendor, model, serial number, OS version, uptime and the interface list. I use it for inventory and for sanity checks at the start of a change: am I on the router I think I am, running the version I expect?</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Getters return the same keys on every driver; values still show vendor habits (float speed, MTU).</li>
<li><code>get_facts()</code> has eight keys; never compare <code>uptime</code>.</li>
<li>BGP results are keyed by VRF with <code>global</code> as the default instance.</li>
<li>A missing getter raises <code>NotImplementedError</code> with an empty message.</li>
<li>Check driver coverage before depending on a getter.</li></ul></div>`,hi:`<p>Getter woh method hai jiska naam <code>get_</code> se shuru hota hai. Aap use bulate ho, aur driver apne platform ke liye jo bhi show commands ya API calls chahiye woh chalata hai, jawab parse karta hai aur ek plain Python dictionary ya list lautata hai jisme <b>har vendor par wahi keys</b> hoti hain. NAPALM ka yeh woh hissa hai jo log sabse pehle use karte hain, aur turant fayda deta hai: ek loop, data ki ek shape.</p>

<h3>Ek analogy: har gaadi mein wahi gauges</h3>
<p>Toyota, Tesla aur Tata ke engine alag hain, par har dashboard mein speedometer aur fuel ya battery gauge aisi jagah hote hain jo aap samajhte ho. Getters dashboard hain. <code>get_facts()</code> pehchaan ki plate hai; <code>get_interfaces()</code> ports ki list hai aur har ek up hai ya nahi; <code>get_bgp_neighbors()</code> peering panel hai.</p>

<h3>Woh getters jo aap har hafte use karoge</h3>
<table class="cmp"><tr><th>Getter</th><th>ios</th><th>eos</th><th>junos</th><th>nxos_ssh</th></tr>
<tr><td><code>get_facts</code></td><td>haan</td><td>haan</td><td>haan</td><td>haan</td></tr>
<tr><td><code>get_interfaces</code></td><td>haan</td><td>haan</td><td>haan (physical)</td><td>haan</td></tr>
<tr><td><code>get_interfaces_ip</code></td><td>haan</td><td>haan</td><td>haan (logical naam)</td><td>haan</td></tr>
<tr><td><code>get_ntp_servers</code></td><td>haan</td><td>haan</td><td>haan</td><td>haan</td></tr>
<tr><td><code>get_bgp_neighbors</code></td><td>haan</td><td>haan</td><td>haan</td><td>haan</td></tr>
<tr><td><code>get_arp_table</code></td><td>haan</td><td>haan</td><td>haan</td><td>haan</td></tr>
<tr><td><code>get_users</code></td><td>haan</td><td>haan</td><td>haan</td><td>haan</td></tr>
<tr><td><code>get_vlans</code></td><td>haan</td><td>haan</td><td>nahi</td><td>haan</td></tr>
<tr><td><code>get_mac_address_table</code></td><td>haan</td><td>haan</td><td>nahi</td><td>haan</td></tr>
<tr><td><code>get_snmp_information</code></td><td>haan</td><td>haan</td><td>nahi</td><td>haan</td></tr>
<tr><td><code>get_bgp_neighbors_detail</code></td><td>haan</td><td>nahi</td><td>nahi</td><td>haan</td></tr></table>
<p>Yeh table woh hai jo lab drivers implement karte hain. Jo getter driver ke paas nahi hota woh <code>NotImplementedError</code> uthata hai jiska message <b>khaali</b> hota hai. Baaki, jaise <code>get_optics</code> aur <code>get_firewall_policies</code>, lab mein har jagah missing hain.</p>

<h3>Teen vendors par facts</h3>
<p><code>get_facts()</code> theek yeh keys lautata hai: <code>hostname</code>, <code>fqdn</code>, <code>vendor</code>, <code>model</code>, <code>serial_number</code>, <code>os_version</code>, <code>uptime</code> aur <code>interface_list</code>. Lab 1, step 1, har device ke liye inme se kuch print karta hai.</p>
<pre class="code">from nkdev import DEVICES, open_device

for name in DEVICES:
    dev = open_device(name)
    f = dev.get_facts()
    print("%-3s %-12s %-8s %-9s %2d interfaces" % (name, f["hostname"], f["vendor"], f["model"], len(f["interface_list"])))
    dev.close()</pre>
<pre class="out">AUTO01$ python3 facts.py
R1  PUN-CORE-R1  Cisco    ISR4331    5 interfaces
J1  J1           Juniper  VMX       16 interfaces
E1  E1           Arista   <span class="hl">vEOS-lab</span>   9 interfaces</pre>
<p>Vendor ka naam waise likha hota hai jaise NAPALM likhta hai (<code>Cisco</code>, <code>Juniper</code>, <code>Arista</code>), isliye aap uske hisaab se group kar sakte ho. Runs ke beech comparison mein kabhi <code>uptime</code> ya <code>serial_number</code> use mat karo: uptime har second badalta hai.</p>

<h3>Interfaces, addresses aur BGP ki shape</h3>
<p>Interface getters interface ke naam se keyed dictionary lautate hain. Har entry mein wahi fields hain, par <em>values</em> mein vendor ki aadatein dikhti hain:</p>
<pre class="code">import json

from nkdev import open_device

for name, ifname in (("R1", "GigabitEthernet0/0"), ("J1", "ge-0/0/0"), ("E1", "Ethernet1")):
    dev = open_device(name)
    info = dev.get_interfaces()[ifname]
    print(name, ifname, json.dumps({k: info[k] for k in ("is_up", "is_enabled", "speed", "mtu")}))
    print("   ip:", json.dumps(dev.get_interfaces_ip().get(ifname) or dev.get_interfaces_ip().get(ifname + ".0")))
    print("   bgp vrf names:", list(dev.get_bgp_neighbors()))
    dev.close()</pre>
<pre class="out">AUTO01$ python3 shape.py
R1 GigabitEthernet0/0 {"is_up": true, "is_enabled": true, "speed": 1000, "mtu": 1500}
   ip: {"ipv4": {"10.99.0.1": {"prefix_length": 24}}}
   bgp vrf names: ['global']
J1 ge-0/0/0 {"is_up": true, "is_enabled": true, "speed": 1000, "mtu": <span class="hl">1514</span>}
   ip: {"ipv4": {"10.99.0.11": {"prefix_length": 24}}}
   bgp vrf names: ['global']
E1 Ethernet1 {"is_up": true, "is_enabled": true, "speed": <span class="hl">1000.0</span>, "mtu": 1500}
   ip: {"ipv4": {"10.99.0.21": {"prefix_length": 24}}}
   bgp vrf names: ['global']</pre>
<ul>
<li><b>speed</b> Mbps mein number hai. EOS float deta hai (<code>1000.0</code>), baaki int. <code>==</code> se compare karo jo dono ko barabar maanta hai, aur agar ek jaisa output chahiye to unhe text ki tarah print mat karo.</li>
<li><b>mtu</b> woh hai jo platform batata hai: Junos apna 14-byte Ethernet header ginta hai (<code>1514</code>), isliye wahi link alag dikh sakta hai.</li>
<li><b>Junos interface names</b> <code>get_interfaces_ip()</code> mein logical units hote hain, <code>ge-0/0/0.0</code>, jabki <code>get_interfaces()</code> physical naam use karta hai. Script address dono naamon se dhoondhti hai.</li>
<li><b>BGP</b> <code>{vrf: {"router_id": ..., "peers": {ip: {...}}}}</code> lautata hai. Default routing instance teeno par <code>global</code> kehlata hai, chahe Junos use <code>master</code> kahe aur IOS ke paas koi naam na ho. Loop likhte waqt yeh tohfa hai.</li></ul>

<h3>Ek script mein kai getters</h3>
<p>Lab 1, step 2: har device ke liye NTP servers aur BGP peers print karo, phir aisa getter try karo jo Junos ke paas nahi hai.</p>
<pre class="code">from nkdev import DEVICES, open_device

for name in DEVICES:
    dev = open_device(name)
    print("%s ntp  %s" % (name, sorted(dev.get_ntp_servers())))
    peers = dev.get_bgp_neighbors()["global"]["peers"]
    print("%s bgp  %s" % (name, ["%s as%s %s" % (ip, p["remote_as"], "up" if p["is_up"] else "down") for ip, p in sorted(peers.items())]))
    try:
        print("%s vlans %s" % (name, sorted(dev.get_vlans())))
    except NotImplementedError as err:
        print("%s get_vlans: %s %r" % (name, type(err).__name__, str(err)))
    dev.close()</pre>
<pre class="out">AUTO01$ python3 getters.py
R1 ntp  ['10.99.0.60']
R1 bgp  ['10.99.0.11 as65002 up', '10.99.0.21 as65003 up']
R1 vlans []
J1 ntp  ['10.99.0.60']
J1 bgp  ['10.99.0.1 as65001 up']
<span class="hl">J1 get_vlans: NotImplementedError ''</span>
E1 ntp  ['10.99.0.60']
E1 bgp  ['10.99.0.1 as65001 up']
E1 vlans [1]</pre>
<p>Aakhri line wahi pattern hai jo yaad rakhna hai. <code>NotImplementedError</code> normal Python exception hai, har getter par pakdi jaati hai, aur kehti hai "yeh driver jawab nahi de sakta", jo "jawab khaali hai" se alag hai (R1 ne <code>[]</code> print kiya, asli khaali list).</p>

<div class="note"><p><b>Lab mein vs asli gear par.</b> Lab drivers simulator ka show output padhte hain, isliye simulator jo alag print kare woh alag dikhta hai: LLDP neighbours khaali hain, environment getter mein sensors nahi, <code>uptime</code> simulator clock follow karta hai, aur J1 par switching nahi, isliye usme <code>get_vlans</code> implement nahi hai. Asli hardware par bharosa karne se pehle apne driver version ki NAPALM support matrix dekho.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Missing key ko <code>.get()</code> ke bajaye seedha index karna (<code>peers["10.1.1.1"]</code>); maan lena ki getter har driver par hai; <code>uptime</code> compare karna; <code>NotImplementedError</code> ko apni script ka bug samajhna jabki woh driver ki khoobi hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Getter data lautata hai; woh device kabhi nahi badalta. Result mein default BGP instance ka naam <code>global</code> hai.</p></div>

<div class="scn"><h4>Upgrade jisne ek column khisaka diya</h4><p>Ek bank ki audit script <code>show ip bgp summary</code> ko spaces par todti thi. Upgrade ke baad ek column chauda ho gaya aur har Junos row ek jagah khisak gayi. Replacement ne <code>get_bgp_neighbors()</code> use kiya; driver ke maintainers ne parser ek baar sabke liye theek kar diya, aur audit code nahi badla.</p><p><b>Lesson:</b> getters parsing ka risk aapki script se maintained driver par le jaate hain.</p></div>

<div class="iv"><p class="q">"get_facts kya lautata hai aur kis kaam aata hai?"</p><p>Ek dictionary jisme hostname, fqdn, vendor, model, serial number, OS version, uptime aur interface list hoti hai. Main ise inventory ke liye aur change shuru karne par sanity check ke liye use karta hoon: kya main wahi router par hoon jo sochta hoon, aur woh expected version chala raha hai?</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Getters har driver par wahi keys lautate hain; values mein vendor ki aadat dikhti hai (float speed, MTU).</li>
<li><code>get_facts()</code> mein aath keys hain; <code>uptime</code> kabhi compare mat karo.</li>
<li>BGP results VRF se keyed hain aur default instance <code>global</code> hai.</li>
<li>Missing getter khaali message ke saath <code>NotImplementedError</code> uthata hai.</li>
<li>Getter par depend karne se pehle driver coverage check karo.</li></ul></div>`}};export{e as default};