var e=[{title:{en:`One tunnel, one session stuck in Active`,hi:`Ek tunnel, ek session Active mein atka`},ticket:{en:`BR1-FGT has two overlay tunnels, both up. The BGP session over HUB1-VPN1 is fine; the one over HUB1-VPN2 stays in Active. The hub tunnel IPs are 169.254.16.1 (VPN1) and 169.254.17.1 (VPN2). Output and configuration are shown (illustrative).`,hi:`BR1-FGT ke do overlay tunnels hain, dono up. HUB1-VPN1 par BGP session theek hai; HUB1-VPN2 wala Active mein rehta hai. Hub tunnel IPs 169.254.16.1 (VPN1) aur 169.254.17.1 (VPN2) hain. Output aur configuration dikhaye gaye hain (illustrative).`},out:`! Reference configuration (not run in the simulator). Illustrative output.
BR1-FGT # get router info bgp summary
Neighbor        V         AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
169.254.16.1    4      65000     210     208       22    0    0 01:12:40        3
169.254.71.1    4      65000       0       0        0    0    0 never     Active

BR1-FGT # show router bgp
config router bgp
    config neighbor
        edit "169.254.16.1"
            set interface "HUB1-VPN1"
            set remote-as 65000
        next
        edit "169.254.71.1"
            set interface "HUB1-VPN2"
            set remote-as 65000
        next
    end
end`,q:{en:`What is the most likely cause?`,hi:`Sabse zyada sambhavit cause kya hai?`},o:[{en:`The hub is not a route reflector`,hi:`Hub route reflector nahi hai`},{en:`The health check has no SLA`,hi:`Health check mein SLA nahi hai`},{en:`The neighbor address is mistyped: it should be 169.254.17.1`,hi:`Neighbor address galat type hua hai: woh 169.254.17.1 hona chahiye`},{en:`ibgp-multipath is disabled`,hi:`ibgp-multipath disabled hai`}],a:2,w:{en:`The configured neighbor 169.254.71.1 does not exist on the VPN2 overlay (the hub is 169.254.17.1), so no TCP session can form and the state stays Active with no messages. Route reflection, SLA and multipath do not affect session establishment.`,hi:`Configured neighbor 169.254.71.1 VPN2 overlay par maujood nahi hai (hub 169.254.17.1 hai), isliye koi TCP session ban nahi sakta aur state bina messages ke Active rehta hai. Route reflection, SLA aur multipath session establishment ko affect nahi karte.`}},{title:{en:`Branches see HQ but not each other`,hi:`Branches HQ dekhte hain lekin ek-dusre ko nahi`},ticket:{en:`BR1-FGT and BR2-FGT are both Established with the hub (iBGP, AS 65000) and both reach 10.10.0.0/16. BR1 cannot reach 10.1.2.0/24. The hub BGP configuration is shown (illustrative).`,hi:`BR1-FGT aur BR2-FGT dono hub se Established hain (iBGP, AS 65000) aur dono 10.10.0.0/16 tak pahunchte hain. BR1 10.1.2.0/24 tak nahi pahunch pata. Hub ki BGP configuration dikhayi gayi hai (illustrative).`},out:`! Reference configuration (not run in the simulator). Illustrative output.
HUB1-FGT # show router bgp
config router bgp
    set as 65000
    set router-id 10.255.255.1
    config neighbor-group
        edit "SPOKES-VPN1"
            set remote-as 65000
            set soft-reconfiguration enable
        next
    end
    config neighbor-range
        edit 1
            set prefix 169.254.16.0 255.255.255.0
            set neighbor-group "SPOKES-VPN1"
        next
    end
end

HUB1-FGT # get router info bgp network 10.1.2.0/24
  Local
    169.254.16.11 from 169.254.16.11 (10.255.255.12)
      Origin IGP metric 0, localpref 100, valid, internal, best`,q:{en:`What is missing?`,hi:`Kya missing hai?`},o:[{en:`route-reflector-client enable in the neighbor-group`,hi:`neighbor-group mein route-reflector-client enable`},{en:`A second AS number for the spokes`,hi:`Spokes ke liye doosra AS number`},{en:`ebgp-enforce-multihop`,hi:`ebgp-enforce-multihop`},{en:`A blackhole route for 10.1.2.0/24`,hi:`10.1.2.0/24 ke liye blackhole route`}],a:0,w:{en:`The hub learns the BR2 prefix but iBGP does not pass routes from one iBGP peer to another. Enabling route-reflector-client on the neighbor-group makes the hub reflect the prefix to BR1. A second AS would turn the design into eBGP, multihop is not needed for iBGP, and a blackhole route would drop the traffic.`,hi:`Hub BR2 ka prefix seekhta hai lekin iBGP ek iBGP peer ke routes doosre iBGP peer ko pass nahi karta. neighbor-group par route-reflector-client enable karne se hub prefix BR1 ko reflect karta hai. Doosra AS design ko eBGP bana deta, iBGP ko multihop nahi chahiye, aur blackhole route traffic drop kar deta.`}},{title:{en:`Backups ignore the overlay`,hi:`Backups overlay ko ignore karte hain`},ticket:{en:`After SD-WAN migration, backup traffic to 10.10.0.0/16 leaves through port1 instead of the overlay tunnels. The SD-WAN rule and SLA are correct. Routing output is shown (illustrative).`,hi:`SD-WAN migration ke baad 10.10.0.0/16 ka backup traffic overlay tunnels ki jagah port1 se nikalta hai. SD-WAN rule aur SLA sahi hain. Routing output dikhaya gaya hai (illustrative).`},out:`! Reference configuration (not run in the simulator). Illustrative output.
BR1-FGT # get router info routing-table details 10.10.0.0
Routing table for VRF=0
Routing entry for 10.10.0.0/16
  Known via "static", distance 10, metric 0, best
  * vrf 0 203.0.113.1, via port1

BR1-FGT # get router info bgp summary
Neighbor        V         AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
169.254.16.1    4      65000     310     305       40    0    0 02:10:11        4`,q:{en:`What is the correct fix?`,hi:`Sahi fix kya hai?`},o:[{en:`Lower the iBGP distance to 5 on the hub`,hi:`Hub par iBGP distance 5 karo`},{en:`Change the SLA thresholds`,hi:`SLA thresholds badlo`},{en:`Enable asymroute`,hi:`asymroute enable karo`},{en:`Remove or re-distance the old static route for 10.10.0.0/16 via port1`,hi:`port1 se 10.10.0.0/16 ka purana static route hatao ya uska distance badlo`}],a:3,w:{en:`A forgotten static route with distance 10 beats the iBGP route (200) that points into the tunnels, so the overlay is never used. The BGP session is healthy and the SLA is irrelevant while the route is not in the table. Remove or re-distance the static route.`,hi:`Distance 10 wala bhoola hua static route iBGP route (200) ko haraata hai jo tunnels mein point karta hai, isliye overlay kabhi use nahi hota. BGP session healthy hai aur jab tak route table mein nahi hai SLA irrelevant hai. Static route hatao ya uska distance badlo.`}},{title:{en:`Voice never uses the second tunnel (OSPF overlay)`,hi:`Voice doosra tunnel kabhi use nahi karti (OSPF overlay)`},ticket:{en:`A small overlay runs OSPF. A voice rule lists HUB1-VPN1 and HUB1-VPN2 but only VPN1 is ever used, even when VPN1 is lossy. The OSPF interface configuration and the route are shown (illustrative).`,hi:`Ek chhote overlay mein OSPF chalta hai. Voice rule mein HUB1-VPN1 aur HUB1-VPN2 listed hain lekin sirf VPN1 use hota hai, VPN1 lossy ho tab bhi. OSPF interface configuration aur route dikhaye gaye hain (illustrative).`},out:`! Reference configuration (not run in the simulator). Illustrative output.
config router ospf
    config ospf-interface
        edit "HUB1-VPN1"
            set interface "HUB1-VPN1"
            set network-type point-to-multipoint
            set cost 10
        next
        edit "HUB1-VPN2"
            set interface "HUB1-VPN2"
            set network-type point-to-multipoint
            set cost 20
        next
    end
end

BR1-FGT # get router info routing-table details 10.10.0.0
Routing entry for 10.10.0.0/16
  Known via "ospf", distance 110, metric 11, best
  * vrf 0 169.254.16.1, via HUB1-VPN1`,q:{en:`Why can the rule not use VPN2?`,hi:`Rule VPN2 kyun use nahi kar sakta?`},o:[{en:`The network type must be broadcast`,hi:`Network type broadcast hona chahiye`},{en:`VPN2 has no route because OSPF installed only the lowest-cost path`,hi:`VPN2 ka route nahi hai kyunki OSPF ne sirf sabse kam cost wala path install kiya`},{en:`OSPF distance is too high`,hi:`OSPF distance bahut high hai`},{en:`The rule needs a route tag`,hi:`Rule ko route tag chahiye`}],a:1,w:{en:`With costs 10 and 20, only the VPN1 route is installed. An SD-WAN rule can choose only members that have a route to the destination, so VPN2 is not a candidate. Give both tunnels the same cost so that ECMP routes are installed and SD-WAN can choose.`,hi:`Costs 10 aur 20 ke saath sirf VPN1 route install hota hai. SD-WAN rule sirf un members ko chun sakta hai jinke paas destination tak route ho, isliye VPN2 candidate nahi hai. Dono tunnels ko same cost do taaki ECMP routes install hon aur SD-WAN chun sake.`}},{title:{en:`The hub never hears about the bad tunnel`,hi:`Hub ko kharab tunnel ke baare mein kabhi pata nahi chalta`},ticket:{en:`The spoke measures VPN1 as out of SLA but the hub keeps sending return traffic over VPN1. Excerpts of the spoke route maps and BGP neighbor are shown (illustrative).`,hi:`Spoke VPN1 ko out of SLA naapta hai lekin hub return traffic VPN1 par bhejta rehta hai. Spoke ke route maps aur BGP neighbor ke excerpts dikhaye gaye hain (illustrative).`},out:`! Reference configuration (not run in the simulator). Illustrative output.
config router route-map
    edit "OUT-VPN1"
        config rule
            edit 1
                set set-community "65000:1"
            next
        end
    next
end
config router bgp
    config neighbor
        edit "169.254.16.1"
            set route-map-out "OUT-VPN1"
        next
    end
end
config system sdwan
    config neighbor
        edit "169.254.16.1"
            set member 3
            set health-check "HUB1_HC"
            set sla-id 1
        next
    end
end`,q:{en:`What must change?`,hi:`Kya badalna chahiye?`},o:[{en:`Disable soft-reconfiguration`,hi:`soft-reconfiguration disable karo`},{en:`Increase the advertisement interval to 30 seconds`,hi:`Advertisement interval 30 seconds karo`},{en:`Use the map in route-map-out-preferable, and keep a different SLA-fail map in route-map-out`,hi:`Map ko route-map-out-preferable mein use karo, aur route-map-out mein alag SLA-fail map rakho`},{en:`Remove the SD-WAN neighbor`,hi:`SD-WAN neighbor hatao`}],a:2,w:{en:`route-map-out is applied when the SLA is not met, so the community 65000:1 (meaning VPN1 is good) is advertised exactly when VPN1 is bad. The good-SLA community belongs in route-map-out-preferable, with a different community in route-map-out so the hub can tell the two states apart.`,hi:`route-map-out tab lagu hota hai jab SLA meet nahi hota, isliye community 65000:1 (matlab VPN1 achha hai) theek tab advertise hoti hai jab VPN1 kharab hai. Good-SLA community route-map-out-preferable mein hoti hai, aur route-map-out mein alag community taaki hub dono states mein fark kar sake.`}},{title:{en:`Internet traffic bypasses the hub inspection`,hi:`Internet traffic hub inspection ko bypass karta hai`},ticket:{en:`The design is central internet breakout: the hub originates a default route and all internet traffic must go through the overlay. On BR1-FGT the internet traffic still leaves through the local ISP. The table is shown (illustrative).`,hi:`Design central internet breakout hai: hub default route originate karta hai aur saara internet traffic overlay se jaana chahiye. BR1-FGT par internet traffic ab bhi local ISP se nikalta hai. Table dikhayi gayi hai (illustrative).`},out:`! Reference configuration (not run in the simulator). Illustrative output.
BR1-FGT # get router info routing-table all
S*      0.0.0.0/0 [10/0] via 203.0.113.1, port1, [1/0]
                  [10/0] via 198.51.100.1, port2, [1/0]
B       0.0.0.0/0 [200/0] via 169.254.16.1, HUB1-VPN1, 00:30:12, [1/0]
B       10.10.0.0/16 [200/0] via 169.254.16.1, HUB1-VPN1, 00:30:12, [1/0]`,q:{en:`What is the right change on the spoke?`,hi:`Spoke par sahi change kya hai?`},o:[{en:`Give the underlay default a distance above 200 (fallback only) and keep host routes to the hub endpoints through the underlay`,hi:`Underlay default ko 200 se zyada distance do (sirf fallback) aur hub endpoints ke host routes underlay se rakho`},{en:`Lower the iBGP distance on the hub`,hi:`Hub par iBGP distance kam karo`},{en:`Add a blackhole route for 0.0.0.0/0 with distance 1`,hi:`Distance 1 ke saath 0.0.0.0/0 ka blackhole route jodo`},{en:`Disable the BGP session`,hi:`BGP session disable karo`}],a:0,w:{en:`The static default (10) beats the BGP default (200), so the traffic stays local. Raising the underlay default's distance above 200 makes it a fallback. The routes to the hub tunnel endpoints must stay on the underlay, otherwise IPsec would try to send its own packets into the tunnel. Lowering iBGP distance on the hub does not affect the spoke's choice, and a blackhole default would drop everything.`,hi:`Static default (10) BGP default (200) ko haraata hai, isliye traffic local rehta hai. Underlay default ka distance 200 se upar karne se woh fallback ban jaata hai. Hub tunnel endpoints ke routes underlay par hi rehne chahiye, warna IPsec apne hi packets ko tunnel mein bhejne ki koshish karega. Hub par iBGP distance kam karna spoke ke chunav ko affect nahi karta, aur blackhole default sab kuch drop kar deta.`}},{title:{en:`Replies dropped at the second hub`,hi:`Replies doosre hub par drop hote hain`},ticket:{en:`File transfers from branch 7 stall. Requests go through HUB1-FGT; a debug flow on HUB2-FGT, which should not see this flow, shows the reply packets of the transfer. Output (illustrative):`,hi:`Branch 7 ke file transfers atakte hain. Requests HUB1-FGT se jaati hain; HUB2-FGT par debug flow, jo is flow ko nahi dekhna chahiye, transfer ke reply packets dikhata hai. Output (illustrative):`},out:`! Reference configuration (not run in the simulator). Illustrative output.
id=65308 trace_id=7 msg="vd-root:0 received a packet(proto=6, 10.10.5.5:443->10.1.7.20:51888) from port3. flag [S.], seq 2133, ack 811"
id=65308 trace_id=7 msg="allocate a new session-0001e2a7"
id=65308 trace_id=7 msg="find a route: flag=00000000 gw-169.254.18.10 via HUB2-VPN1"
id=65308 trace_id=7 msg="Denied by forward policy check (policy 0)"`,q:{en:`Which approach fixes this properly?`,hi:`Kaun sa tareeka ise sahi tarah theek karta hai?`},o:[{en:`Enable asymroute on both hubs`,hi:`Dono hubs par asymroute enable karo`},{en:`Disable the firewall policy check`,hi:`Firewall policy check disable karo`},{en:`Add a second health check`,hi:`Doosra health check jodo`},{en:`Make both hubs announce the data-centre prefix with the same preference (or prepend on the non-preferred hub) so the return path matches the request path`,hi:`Dono hubs data-centre prefix same preference ke saath announce karein (ya non-preferred hub par prepend) taaki return path request path se match kare`}],a:3,w:{en:`The reply reaches a firewall that never saw the request, so there is no matching session and the policy check denies it. Asymroute weakens the checks without fixing the design. The correct fix is symmetric routing: consistent local preference and AS-path prepend, plus community and route-tag steering. A second health check does not change which hub the data centre prefers.`,hi:`Reply aise firewall tak pahunchta hai jisne request dekhi hi nahi, isliye matching session nahi hai aur policy check use deny karta hai. Asymroute design theek kiye bina checks kamzor karta hai. Sahi fix symmetric routing hai: consistent local preference aur AS-path prepend, plus community aur route-tag steering. Doosra health check yeh nahi badalta ki data centre kaun sa hub prefer karta hai.`}}];export{e as default};