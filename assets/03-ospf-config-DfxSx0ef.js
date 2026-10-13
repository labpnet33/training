var e={id:`ospf-config`,h:{en:`Configuring OSPF on FortiOS`,hi:`FortiOS par OSPF configure karna`},body:{en:`
<p>This chapter configures the two-FortiGate topology of the previous chapter. FGT-HQ has port1 10.0.12.1/30 towards the branch, port2 the LAN 10.20.1.0/24 and a loopback 10.255.0.1. FGT-BR has port1 10.0.12.2/30, its LAN 10.30.1.0/24 and loopback 10.255.0.2. Everything is in area 0.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! FGT-HQ</span>
config router ospf
    set router-id 10.255.0.1
    set passive-interface "port2"
    config area
        edit 0.0.0.0
        next
    end
    config network
        edit 1
            set prefix 10.0.12.0 255.255.255.252
            set area 0.0.0.0
        next
        edit 2
            set prefix 10.20.1.0 255.255.255.0
            set area 0.0.0.0
        next
        edit 3
            set prefix 10.255.0.1 255.255.255.255
            set area 0.0.0.0
        next
    end
end</pre>
<p>The <b>network</b> entries decide which interfaces run OSPF: any interface whose address lies inside the prefix is placed in the given area, and its network is advertised. Notice that you advertise the LAN (10.20.1.0/24) but make it <b>passive</b>: the LAN is announced to the branch, yet no hellos are sent into it, so a user cannot form a neighbour with the firewall. Always make user-facing interfaces passive.</p>
<h3>Per-interface parameters</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config router ospf
    config ospf-interface
        edit "TO-BR"
            set interface "port1"
            set network-type point-to-point
            set cost 10
            set hello-interval 10
            set dead-interval 40
            set authentication message-digest
            config md5-keys
                edit 1
                    set key-string "CHANGE-ME-KEY1"
                next
            end
        next
    end
end</pre>
<table class="cmp"><tr><th>Attribute</th><th>Meaning</th></tr><tr><td><code>network-type</code></td><td>broadcast (default), point-to-point, non-broadcast and others. Point-to-point on a /30 avoids a DR election and speeds up the adjacency.</td></tr><tr><td><code>cost</code></td><td>Fixed cost; 0 means derive it from the reference bandwidth.</td></tr><tr><td><code>hello-interval</code> / <code>dead-interval</code></td><td>Timers; must match the neighbour. Defaults 10 and 40.</td></tr><tr><td><code>priority</code></td><td>DR election priority; 0 means never DR.</td></tr><tr><td><code>authentication</code></td><td>none, text or message-digest (MD5). Use message-digest with <code>md5-keys</code>; the key above is a placeholder.</td></tr><tr><td><code>mtu-ignore</code></td><td>Ignore an MTU mismatch (a workaround, fix the MTU instead).</td></tr><tr><td><code>bfd</code></td><td>Fast neighbour-failure detection with Bidirectional Forwarding Detection.</td></tr></table>
<h3>Default route, redistribution and summaries</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config router ospf
    set default-information-originate enable
    config redistribute "connected"
        set status enable
        set metric 20
        set metric-type 2
    end
    config area
        edit 0.0.0.1
            config range
                edit 1
                    set prefix 10.30.0.0 255.255.0.0
                next
            end
        next
    end
end</pre>
<ul><li><code>default-information-originate enable</code> advertises a default route into OSPF if this FortiGate has one itself; <code>always</code> advertises it even without. This is how the head office tells branches "send internet traffic to me".</li><li><code>redistribute</code> brings routes from connected, static, BGP and others into OSPF as external routes (type E2 by default, metric 20). It turns the FortiGate into an ASBR.</li><li>An area <b>range</b> on an ABR summarises the networks of an area into one prefix, which keeps routing tables small.</li></ul>
<p>The same configuration, mirrored, is applied on FGT-BR with its own router ID, its LAN and loopback. Do not forget the firewall policies for the data traffic: for example a policy from port2 to port1 and one from port1 to port2, with the right services, and no NAT between internal networks.</p>
<div class="warn"><p><b>Common mistake.</b> Using a network statement that is too wide, for example 10.0.0.0/8, which silently enables OSPF on every interface in that range, including user and management interfaces. Use exact prefixes and passive-interface for user LANs.</p></div>
<div class="exam"><p><b>Exam trap.</b> Network statements select the interfaces and area; ospf-interface sets per-interface parameters. Passive interfaces advertise their network but form no neighbours.</p></div>
<div class="scn"><h4>The guest Wi-Fi that joined the backbone</h4><p>A broad network statement of 10.0.0.0/8 meant that the guest Wi-Fi interface also sent OSPF hellos. A visitor's laptop running routing software could have formed a neighbour. The audit found it; the fix was exact prefixes, passive-interface on every user VLAN and MD5 authentication on the real links.</p><p><b>Lesson:</b> Advertise the LAN, but never speak OSPF into it.</p></div>
<div class="iv"><p class="q">"How do you stop a FortiGate from forming OSPF neighbours on a user LAN but still advertise that LAN?"</p><p>Include the LAN in a network statement so it is advertised, and add the interface to passive-interface, which suppresses hellos. I also use MD5 authentication on the real links and exact prefixes in network statements.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Network statements pick the interfaces and areas that run OSPF.</li><li>Use passive-interface for user LANs, point-to-point on /30 links, MD5 on real links.</li><li>default-information-originate and redistribute make the FortiGate an ASBR.</li><li>Area ranges summarise at the ABR; firewall policies are still required.</li></ul></div>
`,hi:`
<p>Yeh chapter pichhle chapter ki do-FortiGate topology configure karta hai. FGT-HQ ke paas branch ki taraf port1 10.0.12.1/30, port2 par LAN 10.20.1.0/24 aur loopback 10.255.0.1 hai. FGT-BR ke paas port1 10.0.12.2/30, uska LAN 10.30.1.0/24 aur loopback 10.255.0.2 hai. Sab kuch area 0 mein hai.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! FGT-HQ</span>
config router ospf
    set router-id 10.255.0.1
    set passive-interface "port2"
    config area
        edit 0.0.0.0
        next
    end
    config network
        edit 1
            set prefix 10.0.12.0 255.255.255.252
            set area 0.0.0.0
        next
        edit 2
            set prefix 10.20.1.0 255.255.255.0
            set area 0.0.0.0
        next
        edit 3
            set prefix 10.255.0.1 255.255.255.255
            set area 0.0.0.0
        next
    end
end</pre>
<p><b>Network</b> entries tay karti hain ki kaun se interfaces OSPF chalate hain: jis interface ka address prefix ke andar ho use diye gaye area mein rakha jaata hai aur uska network advertise hota hai. Dhyan do ki aap LAN (10.20.1.0/24) ko advertise karte ho lekin use <b>passive</b> rakhte ho: LAN branch ko announce hota hai, par us mein hellos nahi bheje jaate, isliye koi user firewall ke saath neighbour nahi bana sakta. User-facing interfaces ko hamesha passive rakho.</p>
<h3>Per-interface parameters</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config router ospf
    config ospf-interface
        edit "TO-BR"
            set interface "port1"
            set network-type point-to-point
            set cost 10
            set hello-interval 10
            set dead-interval 40
            set authentication message-digest
            config md5-keys
                edit 1
                    set key-string "CHANGE-ME-KEY1"
                next
            end
        next
    end
end</pre>
<table class="cmp"><tr><th>Attribute</th><th>Matlab</th></tr><tr><td><code>network-type</code></td><td>broadcast (default), point-to-point, non-broadcast aur aur. /30 par point-to-point DR election se bachata hai aur adjacency tez karta hai.</td></tr><tr><td><code>cost</code></td><td>Fixed cost; 0 ka matlab reference bandwidth se nikalo.</td></tr><tr><td><code>hello-interval</code> / <code>dead-interval</code></td><td>Timers; neighbour se match hone chahiye. Defaults 10 aur 40.</td></tr><tr><td><code>priority</code></td><td>DR election priority; 0 ka matlab kabhi DR nahi.</td></tr><tr><td><code>authentication</code></td><td>none, text ya message-digest (MD5). <code>md5-keys</code> ke saath message-digest use karo; upar ki key placeholder hai.</td></tr><tr><td><code>mtu-ignore</code></td><td>MTU mismatch ignore karo (workaround, MTU hi theek karo).</td></tr><tr><td><code>bfd</code></td><td>Bidirectional Forwarding Detection se neighbour-failure ki tez detection.</td></tr></table>
<h3>Default route, redistribution aur summaries</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config router ospf
    set default-information-originate enable
    config redistribute "connected"
        set status enable
        set metric 20
        set metric-type 2
    end
    config area
        edit 0.0.0.1
            config range
                edit 1
                    set prefix 10.30.0.0 255.255.0.0
                next
            end
        next
    end
end</pre>
<ul><li><code>default-information-originate enable</code> OSPF mein default route tab advertise karta hai jab is FortiGate ke paas khud ho; <code>always</code> bina default ke bhi advertise karta hai. Head office isi tarah branches ko batata hai "internet traffic mujhe bhejo".</li><li><code>redistribute</code> connected, static, BGP aadi ke routes ko OSPF mein external routes ke roop mein laata hai (default E2 type, metric 20). Yeh FortiGate ko ASBR bana deta hai.</li><li>ABR par area <b>range</b> area ke networks ko ek prefix mein summarise karta hai, jisse routing tables chhoti rehti hain.</li></ul>
<p>Wahi configuration, mirror karke, FGT-BR par apne router ID, LAN aur loopback ke saath lagti hai. Data traffic ki firewall policies mat bhoolna: jaise port2 se port1 aur port1 se port2 ki policy, sahi services ke saath, aur internal networks ke beech NAT nahi.</p>
<div class="warn"><p><b>Common galti.</b> Bahut chauda network statement use karna, jaise 10.0.0.0/8, jo us range ke har interface par, user aur management interfaces samet, OSPF chupchaap enable kar deta hai. Exact prefixes aur user LANs ke liye passive-interface use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Network statements interfaces aur area chunte hain; ospf-interface per-interface parameters set karta hai. Passive interfaces apna network advertise karte hain par neighbours nahi banate.</p></div>
<div class="scn"><h4>Guest Wi-Fi jo backbone mein jud gaya</h4><p>10.0.0.0/8 ke broad network statement ka matlab tha ki guest Wi-Fi interface bhi OSPF hellos bhejta tha. Routing software chalane wala visitor ka laptop neighbour bana sakta tha. Audit ne pakda; fix exact prefixes, har user VLAN par passive-interface aur asli links par MD5 authentication tha.</p><p><b>Seekh:</b> LAN ko advertise karo, lekin usme kabhi OSPF mat bolo.</p></div>
<div class="iv"><p class="q">"FortiGate ko user LAN par OSPF neighbours banane se kaise roka jaaye lekin us LAN ko advertise kaise kiya jaaye?"</p><p>LAN ko network statement mein shamil karo taaki woh advertise ho, aur interface ko passive-interface mein jodo, jo hellos rokta hai. Asli links par MD5 authentication aur network statements mein exact prefixes bhi use karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Network statements OSPF chalane wale interfaces aur areas chunte hain.</li><li>User LANs ke liye passive-interface, /30 links par point-to-point, asli links par MD5 use karo.</li><li>default-information-originate aur redistribute FortiGate ko ASBR banate hain.</li><li>Area ranges ABR par summarise karte hain; firewall policies phir bhi chahiye.</li></ul></div>
`}};export{e as default};