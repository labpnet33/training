var e={id:`static-routes`,h:{en:`Static routes: dst, gateway, device, distance and priority`,hi:`Static routes: dst, gateway, device, distance aur priority`},body:{en:`
<p>A static route is a hand-written signpost: "to reach 172.16.5.0/24, go via 10.0.99.2". It uses no bandwidth and no CPU, is easy to understand and is predictable. The cost is that nobody updates it for you: if the network changes, you must edit the route. Static routes are the right tool for small networks, for the default route to the internet and for stub networks behind one router.</p>
<h3>The configuration</h3>
<pre class="code">config router static
    edit 2
        set dst 172.16.5.0 255.255.255.0
        set gateway 10.0.99.2
        set device "port3"
    next
end</pre>
<p>The number after <code>edit</code> is only an ID. It does not set the order of preference. FortiOS writes the destination as address and mask (not slash), and an entry without <code>dst</code> is the default route 0.0.0.0/0. The <b>gateway</b> must be an address inside a network that is directly connected to the chosen <b>device</b> (the egress interface).</p>
<table class="cmp"><tr><th>Attribute</th><th>Meaning</th></tr><tr><td><code>dst</code></td><td>Destination network and mask. Omit for the default route.</td></tr><tr><td><code>gateway</code></td><td>Next-hop IP on a connected subnet.</td></tr><tr><td><code>device</code></td><td>Egress interface. Required.</td></tr><tr><td><code>distance</code></td><td>1 to 255, default 10. Lower is preferred (chapter 5).</td></tr><tr><td><code>priority</code></td><td>Tie-break among equal distance, default 1. Lower wins.</td></tr><tr><td><code>weight</code></td><td>Share of traffic for load-balancing routes (ECMP).</td></tr><tr><td><code>status</code></td><td>enable or disable the route without deleting it.</td></tr><tr><td><code>blackhole</code></td><td>Silently drop matching packets (chapter 6).</td></tr><tr><td><code>comment</code></td><td>Free-text note, good practice.</td></tr></table>
<p>Other attributes exist on a real FortiGate, for example <code>dstaddr</code> (use an address object as the destination), <code>internet-service</code>, <code>sdwan-zone</code>, <code>vrf</code> and <code>bfd</code>. They are not run in the simulator; the SD-WAN module returns to <code>sdwan-zone</code>.</p>
<h3>Worked example: the warehouse route</h3>
<div class="eg"><p><b>Worked example.</b> In the first lab the firewall already has <code>edit 1</code> (the default route via 203.0.113.1 on port1). We add route 2 for 172.16.5.0/24 via R2 at 10.0.99.2 on port3. Afterwards the table has the new line:</p></div>
<pre class="out">NK-WH-FGT # get router info routing-table static
S*      0.0.0.0/0 [10/0] via 203.0.113.1, port1, [1/0]
<span class="hl">S       172.16.5.0/24 [10/0] via 10.0.99.2, port3, [1/0</span>]

NK-WH-FGT # show router static
config router static
    edit 1
        set gateway 203.0.113.1
        set device "port1"
    next
    edit 2
        set dst 172.16.5.0 255.255.255.0
        set gateway 10.0.99.2
        set device "port3"
    next
end</pre>
<p><code>show router static</code> prints only values that differ from the defaults, which is why distance 10 and priority 1 are not listed. On a real device <code>show full-configuration router static</code> prints everything.</p>
<p>Do not forget the return path. Route 2 lets the FortiGate reach the warehouse, but R2 also needs a way back to the internet; here R2 has its own default route to 10.0.99.1.</p>
<div class="warn"><p><b>Common mistake.</b> Choosing the wrong <code>device</code>, or a gateway that is not inside the subnet of that interface. The route may not install, or traffic leaves the wrong port. Always check with <code>get router info routing-table all</code> right after <code>end</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> A default route is simply a static route with no <code>dst</code>, or with 0.0.0.0 0.0.0.0. The entry ID does not matter for selection; distance and priority do.</p></div>
<div class="scn"><h4>Sales tablets in the new building</h4><p>A branch added a router for a new building (172.16.8.0/24) behind the firewall's port3. The tablets could reach the router but not the internet. The engineer noticed that the firewall had no route for 172.16.8.0/24 and added one with a comment "new building via R3". The internet worked immediately because the return path now existed.</p><p><b>Lesson:</b> Every network behind another router needs a route on the firewall, and a comment tells the next engineer why.</p></div>
<div class="iv"><p class="q">"What is the difference between gateway and device in a static route?"</p><p>The gateway is the next-hop IP address; the device is the egress interface. The gateway must be inside a subnet connected to that interface. On Ethernet the FortiGate ARPs for the gateway on that device. Mention that the default distance is 10 and that a route without <code>dst</code> is the default route.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>A static route needs dst and mask, a gateway on a connected subnet, and a device.</li><li>The entry number is an ID, not a preference.</li><li>Default distance is 10 and default priority is 1.</li><li>Routers behind the firewall need a route on the firewall and a route back.</li><li>Verify with <code>get router info routing-table all</code> after every change.</li></ul></div>
`,hi:`
<p>Static route haath se likha signpost hai: "172.16.5.0/24 tak pahunchne ke liye 10.0.99.2 se jao". Isme bandwidth ya CPU nahi lagta, samajhna aasan hai aur predictable hai. Keemat yeh hai ki koi use khud update nahi karta: network badle to route aapko edit karna padta hai. Static routes chhote networks, internet ke default route aur ek router ke peeche stub networks ke liye sahi tool hain.</p>
<h3>Configuration</h3>
<pre class="code">config router static
    edit 2
        set dst 172.16.5.0 255.255.255.0
        set gateway 10.0.99.2
        set device "port3"
    next
end</pre>
<p><code>edit</code> ke baad ka number sirf ID hai. Woh preference ka order tay nahi karta. FortiOS destination ko address aur mask (slash nahi) mein likhta hai, aur <code>dst</code> ke bina entry default route 0.0.0.0/0 hoti hai. <b>Gateway</b> aisa address hona chahiye jo chune gaye <b>device</b> (egress interface) se directly connected network ke andar ho.</p>
<table class="cmp"><tr><th>Attribute</th><th>Matlab</th></tr><tr><td><code>dst</code></td><td>Destination network aur mask. Default route ke liye chhod do.</td></tr><tr><td><code>gateway</code></td><td>Connected subnet par next-hop IP.</td></tr><tr><td><code>device</code></td><td>Egress interface. Zaroori.</td></tr><tr><td><code>distance</code></td><td>1 se 255, default 10. Kam behtar (chapter 5).</td></tr><tr><td><code>priority</code></td><td>Barabar distance mein tie-break, default 1. Kam jeetta hai.</td></tr><tr><td><code>weight</code></td><td>Load-balancing routes (ECMP) ke liye traffic ka hissa.</td></tr><tr><td><code>status</code></td><td>Route ko delete kiye bina enable ya disable karo.</td></tr><tr><td><code>blackhole</code></td><td>Matching packets chupchaap drop karo (chapter 6).</td></tr><tr><td><code>comment</code></td><td>Free-text note, achhi practice.</td></tr></table>
<p>Real FortiGate par aur attributes bhi hote hain, jaise <code>dstaddr</code> (address object ko destination banana), <code>internet-service</code>, <code>sdwan-zone</code>, <code>vrf</code> aur <code>bfd</code>. Inhe simulator mein nahi chalaya jaata; SD-WAN module <code>sdwan-zone</code> par wapas aata hai.</p>
<h3>Worked example: warehouse route</h3>
<div class="eg"><p><b>Worked example.</b> Pehle lab mein firewall ke paas pehle se <code>edit 1</code> hai (port1 par 203.0.113.1 ke through default route). Hum port3 par R2 (10.0.99.2) ke through 172.16.5.0/24 ka route 2 add karte hain. Uske baad table mein nayi line aa jaati hai:</p></div>
<pre class="out">NK-WH-FGT # get router info routing-table static
S*      0.0.0.0/0 [10/0] via 203.0.113.1, port1, [1/0]
<span class="hl">S       172.16.5.0/24 [10/0] via 10.0.99.2, port3, [1/0</span>]

NK-WH-FGT # show router static
config router static
    edit 1
        set gateway 203.0.113.1
        set device "port1"
    next
    edit 2
        set dst 172.16.5.0 255.255.255.0
        set gateway 10.0.99.2
        set device "port3"
    next
end</pre>
<p><code>show router static</code> sirf woh values chhapta hai jo default se alag hon, isliye distance 10 aur priority 1 nahi dikhte. Real device par <code>show full-configuration router static</code> sab kuch chhapta hai.</p>
<p>Return path mat bhoolna. Route 2 FortiGate ko warehouse tak pahunchata hai, lekin R2 ko bhi internet tak wapas jaane ka raasta chahiye; yahan R2 ke paas 10.0.99.1 ka apna default route hai.</p>
<div class="warn"><p><b>Common galti.</b> Galat <code>device</code> chunna, ya aisa gateway jo us interface ke subnet mein nahi hai. Route install nahi hoga, ya traffic galat port se niklega. <code>end</code> ke turant baad <code>get router info routing-table all</code> se check karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Default route sirf aisa static route hai jisme <code>dst</code> nahi hota, ya 0.0.0.0 0.0.0.0 hota hai. Selection mein entry ID matter nahi karti; distance aur priority karti hain.</p></div>
<div class="scn"><h4>Nayi building mein sales tablets</h4><p>Branch ne firewall ke port3 ke peeche nayi building (172.16.8.0/24) ke liye router lagaya. Tablets router tak pahunchte the lekin internet nahi. Engineer ne dekha ki firewall ke paas 172.16.8.0/24 ka route nahi hai aur comment "new building via R3" ke saath route add kar diya. Internet turant chal gaya kyunki ab return path maujood tha.</p><p><b>Seekh:</b> Doosre router ke peeche har network ke liye firewall par route chahiye, aur comment agle engineer ko wajah batata hai.</p></div>
<div class="iv"><p class="q">"Static route mein gateway aur device mein kya difference hai?"</p><p>Gateway next-hop IP address hai; device egress interface hai. Gateway us interface se connected subnet ke andar hona chahiye. Ethernet par FortiGate us device par gateway ke liye ARP karta hai. Yeh bhi batao ki default distance 10 hai aur <code>dst</code> ke bina route default route hota hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Static route ko dst aur mask, connected subnet par gateway aur device chahiye.</li><li>Entry number ID hai, preference nahi.</li><li>Default distance 10 aur default priority 1 hai.</li><li>Firewall ke peeche ke routers ko firewall par route aur wapas ka route chahiye.</li><li>Har change ke baad <code>get router info routing-table all</code> se verify karo.</li></ul></div>
`}};export{e as default};