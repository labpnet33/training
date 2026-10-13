var e=[{title:{en:`Policy 0: nothing to inspect`,hi:`Policy 0: inspect karne ko kuch nahi`},ticket:{en:`A web filter profile was attached to the LAN-to-DMZ rule, yet users cannot open the intranet web page and no web filter log appears. A debug flow was captured on the FortiGate for the server 10.0.2.10 (captured in the simulator, lab nse4-diag).`,hi:`LAN-to-DMZ rule par web filter profile attach hua, phir bhi users intranet web page nahi khol paate aur koi web filter log nahi aata. FortiGate par server 10.0.2.10 ke liye debug flow capture hua (simulator lab nse4-diag se captured).`},out:`diagnose debug flow filter addr 10.0.2.10
diagnose debug flow show function-name enable
diagnose debug flow trace start 10
diagnose debug enable
msg="vd-root:0 received a packet(proto=6, 10.0.1.10:64251->10.0.2.10:80) from port2. flag [S]"
msg="allocate a new session-000025d1"
msg="find a route: flag=04000000 gw-10.0.2.10 via port3"
msg="in-[port2], out-[port3], skb_flags-02000000, vid-0, app_id: 0, url_cat_id: 0"
msg="Denied by forward policy check (policy 0)"`,q:{en:`Why does no web filter log appear?`,hi:`Web filter log kyun nahi aata?`},o:[{en:`No policy allows the service, so the implicit deny drops the session before any profile can run`,hi:`Koi policy service allow nahi karti, isliye implicit deny profile chalne se pehle session drop kar deta hai`},{en:`The web filter database is out of date`,hi:`Web filter database outdated hai`},{en:`The route to the server is missing`,hi:`Server ka route missing hai`},{en:`The SSL profile is in proxy mode`,hi:`SSL profile proxy mode mein hai`}],a:0,w:{en:`Policy 0 means implicit deny. Profiles run only on accepted traffic, and the route was found, so routing is not the cause.`,hi:`Policy 0 matlab implicit deny. Profiles sirf accepted traffic par chalte hain, aur route mil gaya tha, isliye routing wajah nahi.`}},{title:{en:`The rule above the rule`,hi:`Rule ke upar wala rule`},ticket:{en:`Sales users still reach a blocked category although the staff rule has the web filter. Policy excerpt from a reference configuration (not run in the simulator).`,hi:`Sales users blocked category tak pahunch rahe hain jabki staff rule mein web filter hai. Reference configuration ka policy excerpt (simulator mein nahi chalaya).`},out:`! Reference configuration (not run in the simulator)
config firewall policy
    edit 12
        set name "SALES-to-WAN"
        set srcintf "port2"
        set dstintf "port1"
        set srcaddr "SALES-NET"
        set dstaddr "all"
        set action accept
        set service "ALL"
        set nat enable
    next
    edit 10
        set name "STAFF-to-WAN"
        set srcintf "port2"
        set dstintf "port1"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set service "ALL"
        set utm-status enable
        set webfilter-profile "NK-WEB"
        set nat enable
    next
end`,q:{en:`What explains the sales users bypassing the filter?`,hi:`Sales users filter kyun bypass kar rahe hain?`},o:[{en:`The web filter profile is corrupt`,hi:`Web filter profile corrupt hai`},{en:`Policy 12 comes first and matches sales traffic, and it has no web filter profile`,hi:`Policy 12 pehle aati hai aur sales traffic match karti hai, aur uspar web filter profile nahi`},{en:`NAT disables web filtering`,hi:`NAT web filtering disable karta hai`},{en:`Profiles only work on port1`,hi:`Profiles sirf port1 par kaam karte hain`}],a:1,w:{en:`The first matching policy handles the traffic. Fix the order or attach the profile (or profile group) to policy 12.`,hi:`Pehli matching policy traffic handle karti hai. Order theek karo ya policy 12 par profile (ya profile group) attach karo.`}},{title:{en:`Exempt skips more than the web filter`,hi:`Exempt web filter se zyada skip karta hai`},ticket:{en:`A partner portal was added to the URL filter as exempt so staff can reach it. Security later finds downloads from that portal were never scanned by antivirus. Reference configuration (not run in the simulator).`,hi:`Partner portal URL filter mein exempt ke roop mein jodi gayi taaki staff pahunch sake. Baad mein security ko pata chala ki us portal ke downloads antivirus ne kabhi scan nahi kiye. Reference configuration (simulator mein nahi chalaya).`},out:`! Reference configuration (not run in the simulator)
config webfilter urlfilter
    edit 1
        set name "NK-URLS"
        config entries
            edit 1
                set url "erp.partner.example"
                set type simple
                set action exempt
            next
        end
    next
end`,q:{en:`What is the best change?`,hi:`Sabse acha change kaunsa hai?`},o:[{en:`Delete the antivirus profile`,hi:`Antivirus profile delete karo`},{en:`Switch the whole policy to proxy mode`,hi:`Poori policy proxy mode par karo`},{en:`Disable the web filter`,hi:`Web filter disable karo`},{en:`Change the action from exempt to allow so other inspection still runs`,hi:`Action exempt se allow karo taaki doosra inspection chalta rahe`}],a:3,w:{en:`Exempt bypasses further inspection for that traffic. Allow lets the URL pass the static filter while category checks and antivirus still run.`,hi:`Exempt us traffic ka aage ka inspection bypass karta hai. Allow URL ko static filter se guzarne deta hai jabki category checks aur antivirus chalte rehte hain.`}},{title:{en:`Blocked search keyword is not filtered`,hi:`Blocked search keyword filter nahi hota`},ticket:{en:`The team wants to block pages by URL path on an encrypted site, but the filter only acts on the host name. The policy excerpt is a reference configuration (not run in the simulator).`,hi:`Team encrypted site par URL path se pages block karna chahti hai, lekin filter sirf host name par kaam karta hai. Policy excerpt reference configuration hai (simulator mein nahi chalaya).`},out:`! Reference configuration (not run in the simulator)
config firewall policy
    edit 10
        set utm-status enable
        set ssl-ssh-profile "no-inspection"
        set webfilter-profile "NK-WEB"
    next
end`,q:{en:`Why can the path not be filtered?`,hi:`Path filter kyun nahi ho sakta?`},o:[{en:`Without decryption the FortiGate sees only the server name and certificate, not the path`,hi:`Decryption ke bina FortiGate sirf server name aur certificate dekhta hai, path nahi`},{en:`Paths can never be filtered on a FortiGate`,hi:`FortiGate par paths kabhi filter nahi ho sakte`},{en:`The web filter is in monitor mode`,hi:`Web filter monitor mode mein hai`},{en:`The policy needs NAT disabled`,hi:`Policy mein NAT disable hona chahiye`}],a:0,w:{en:`With no-inspection the session is opaque. Path filtering needs deep inspection, with exemptions and consent considered.`,hi:`No-inspection mein session opaque hai. Path filtering ke liye deep inspection chahiye, exemptions aur consent ka dhyan rakhte hue.`}},{title:{en:`IPS log shows a patch tool reset`,hi:`IPS log patch tool ka reset dikhata hai`},ticket:{en:`After blocking was enabled, a vendor patch client keeps failing. Illustrative IPS log line (reference excerpt, not captured from the simulator).`,hi:`Blocking enable hone ke baad vendor patch client baar baar fail ho raha hai. Illustrative IPS log line (reference excerpt, simulator se capture nahi).`},out:`! Reference log excerpt (illustrative, not captured)
type="utm" subtype="ips" level="alert" srcip=10.0.1.77 dstip=192.0.2.80
policyid=10 severity="high" action="reset" attack="Sample.Patch.Client.Pattern"
direction="outgoing" msg="signature matched on update traffic"`,q:{en:`What is the best fix?`,hi:`Sabse acha fix kya hai?`},o:[{en:`Disable IPS on all policies`,hi:`Saari policies par IPS disable karo`},{en:`Add a narrow exemption for that signature and the patch server, or set that signature to pass with logging`,hi:`Us signature aur patch server ke liye narrow exemption jodo, ya us signature ko logging ke saath pass par set karo`},{en:`Raise the signature severity`,hi:`Signature severity badhao`},{en:`Reboot the FortiGate`,hi:`FortiGate reboot karo`}],a:1,w:{en:`The signature is firing on a known-good flow: a false positive. Keep the sensor, make the exception narrow and document it.`,hi:`Signature known-good flow par fire ho raha hai: false positive. Sensor rakho, exception narrow banao aur document karo.`}},{title:{en:`Application entries in the wrong order`,hi:`Application entries galat order mein`},ticket:{en:`The helpdesk may use one approved remote-support tool, but it is blocked. Simplified application list (reference configuration, not run in the simulator).`,hi:`Helpdesk ek approved remote-support tool use kar sakta hai, lekin woh blocked hai. Simplified application list (reference configuration, simulator mein nahi chalaya).`},out:`! Reference configuration (not run in the simulator), simplified
config application list
    edit "NK-APP"
        config entries
            edit 1
                set category 7
                set action block
            next
            edit 2
                set application "Approved.Remote.Tool"
                set action pass
            next
        end
    next
end`,q:{en:`Why is the approved tool blocked?`,hi:`Approved tool blocked kyun hai?`},o:[{en:`Application lists cannot contain pass entries`,hi:`Application lists mein pass entries nahi ho sakti`},{en:`Entry 2 must use action reset`,hi:`Entry 2 ko action reset use karna chahiye`},{en:`The tool needs a DoS policy`,hi:`Tool ko DoS policy chahiye`},{en:`Entries are evaluated in order, so the broad block entry 1 matches before the specific pass entry 2`,hi:`Entries order mein evaluate hoti hain, isliye broad block entry 1 specific pass entry 2 se pehle match hoti hai`}],a:3,w:{en:`First match wins. Move the specific allow above the broad block, or scope the exception to the helpdesk with its own policy.`,hi:`Pehla match jeetta hai. Specific allow ko broad block ke upar le jao, ya helpdesk ke liye alag policy se exception scope karo.`}},{title:{en:`The new internal portal is Unrated`,hi:`Naya internal portal Unrated hai`},ticket:{en:`The baseline blocks Unrated websites. A new internal portal is blocked for everybody. Illustrative web filter log line (reference excerpt, not captured from the simulator).`,hi:`Baseline Unrated websites block karta hai. Naya internal portal sabke liye block ho gaya. Illustrative web filter log line (reference excerpt, simulator se capture nahi).`},out:`! Reference log excerpt (illustrative, not captured)
type="utm" subtype="webfilter" eventtype="ftgd_blk" level="warning"
srcip=10.0.1.10 policyid=10 hostname="portal.nwk.example"
catdesc="Unrated" action="blocked"`,q:{en:`What is the safest fix that keeps the Unrated block for everything else?`,hi:`Sabse safe fix kaunsa hai jo baaki sab ke liye Unrated block rakhe?`},o:[{en:`Add a local rating for portal.nwk.example (for example Business) on this FortiGate`,hi:`Is FortiGate par portal.nwk.example ke liye local rating (jaise Business) jodo`},{en:`Stop blocking the Unrated category`,hi:`Unrated category block karna band karo`},{en:`Exempt the whole internal network`,hi:`Poora internal network exempt karo`},{en:`Turn off logging`,hi:`Logging band karo`}],a:0,w:{en:`A local rating gives only this host a known category. Unrated stays blocked for unknown sites, and other inspections still run.`,hi:`Local rating sirf is host ko known category deti hai. Unknown sites ke liye Unrated blocked rehti hai, aur doosre inspections chalte rehte hain.`}}];export{e as default};