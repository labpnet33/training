var e=[{title:{en:`Warnings on one personal laptop only`,hi:`Sirf ek personal laptop par warnings`},ticket:{en:`Deep inspection was enabled yesterday. Managed laptops are fine, but the CEO personal laptop shows a warning on every site. Illustrative client-side detail (reference excerpt, not captured from the simulator).`,hi:`Kal deep inspection enable hua. Managed laptops theek hain, lekin CEO ke personal laptop par har site par warning aati hai. Illustrative client-side detail (reference excerpt, simulator se capture nahi).`},out:`! Reference excerpt (illustrative, not captured)
Site:    news.example
Issuer:  Fortinet_CA_SSL
Status:  issuer is not trusted by this device
Managed laptops: issuer chain ends in the enterprise root, no warning`,q:{en:`What is the correct response?`,hi:`Sahi response kya hai?`},o:[{en:`Disable deep inspection for everybody`,hi:`Sabke liye deep inspection disable karo`},{en:`Tell the CEO to ignore the warning`,hi:`CEO ko warning ignore karne ko kaho`},{en:`Keep unmanaged devices on certificate inspection (or install the trusted CA if the device is formally managed)`,hi:`Unmanaged devices ko certificate inspection par rakho (ya device formally managed ho to trusted CA install karo)`},{en:`Reboot the FortiGate`,hi:`FortiGate reboot karo`}],a:2,w:{en:`The device does not trust the inspection CA. Unmanaged devices should not be deep inspected; managed ones get the CA through Group Policy or MDM.`,hi:`Device inspection CA par trust nahi karta. Unmanaged devices deep inspect nahi hone chahiye; managed devices ko CA Group Policy ya MDM se milta hai.`}},{title:{en:`One site warns, others do not`,hi:`Ek site warn karti hai, baaki nahi`},ticket:{en:`All sites work through deep inspection except one supplier portal, which shows a certificate warning for every user. Illustrative detail (reference excerpt, not captured from the simulator).`,hi:`Deep inspection se saari sites chalti hain siwaye ek supplier portal ke, jo har user ko certificate warning dikhata hai. Illustrative detail (reference excerpt, simulator se capture nahi).`},out:`! Reference excerpt (illustrative, not captured)
Site:            supplier.example
Real certificate: expired
Copy presented to client: signed by Fortinet_CA_Untrusted`,q:{en:`What explains a warning on this one site?`,hi:`Is ek site par warning ka kya karan hai?`},o:[{en:`The real server certificate is invalid, so the FortiGate used the untrusted CA and users see a warning on purpose`,hi:`Asli server certificate invalid hai, isliye FortiGate ne untrusted CA use kiya aur users ko jaanboojhkar warning dikhti hai`},{en:`The inspection CA expired`,hi:`Inspection CA expire ho gaya`},{en:`The client lacks the enterprise root`,hi:`Client ke paas enterprise root nahi`},{en:`The site is exempt`,hi:`Site exempt hai`}],a:0,w:{en:`A copy signed by Fortinet_CA_Untrusted means the real certificate failed validation. The supplier must fix its certificate.`,hi:`Fortinet_CA_Untrusted se sign copy ka matlab asli certificate validation fail hua. Supplier ko apna certificate fix karna chahiye.`}},{title:{en:`The app that works only at home`,hi:`App jo sirf ghar par chalti hai`},ticket:{en:`A sales app fails to log in from the office but works on cellular. The office policy uses deep inspection. Policy and exemption excerpt (reference configuration, not run in the simulator).`,hi:`Sales app office se login nahi karti lekin cellular par chalti hai. Office policy deep inspection use karti hai. Policy aur exemption excerpt (reference configuration, simulator mein nahi chalaya).`},out:`! Reference configuration (not run in the simulator)
config firewall policy
    edit 10
        set ssl-ssh-profile "NK-DEEP"
    next
end
config firewall ssl-ssh-profile
    edit "NK-DEEP"
        config ssl-exempt
            edit 1
                set type fortiguard-category
                set fortiguard-category 31
            next
        end
    next
end`,q:{en:`Most likely cause and fix?`,hi:`Sabse sambhavit karan aur fix?`},o:[{en:`The app needs a larger MTU`,hi:`App ko bada MTU chahiye`},{en:`The route to the internet is missing`,hi:`Internet ka route missing hai`},{en:`The profile must be set to no-inspection for all users`,hi:`Profile sabke liye no-inspection par hona chahiye`},{en:`The app pins its certificate; exempt its hosts from deep inspection`,hi:`App certificate pin karti hai; uske hosts ko deep inspection se exempt karo`}],a:3,w:{en:`Works outside the inspected path but fails inside: pinning is the classic cause. Exempt just that app hosts.`,hi:`Inspected path ke bahar chalti hai lekin andar fail: pinning classic karan hai. Sirf us app ke hosts exempt karo.`}},{title:{en:`The exemption that was cleaned up`,hi:`Exemption jo clean-up mein hata di gayi`},ticket:{en:`An audit asks whether staff online banking is decrypted. The current profile is shown below (reference configuration, not run in the simulator).`,hi:`Audit poochta hai ki staff ki online banking decrypt hoti hai ya nahi. Current profile neeche hai (reference configuration, simulator mein nahi chalaya).`},out:`! Reference configuration (not run in the simulator)
config firewall ssl-ssh-profile
    edit "NK-DEEP"
        config ssl-exempt
            edit 4
                set type wildcard-fqdn
                set wildcard-fqdn "NK-UPDATE-HOSTS"
            next
        end
    next
end`,q:{en:`What is the finding?`,hi:`Finding kya hai?`},o:[{en:`Nothing: banking is always exempt by default`,hi:`Kuch nahi: banking hamesha default exempt hoti hai`},{en:`The Finance and Banking (and Health) category exemptions are missing; restore them`,hi:`Finance and Banking (aur Health) category exemptions missing hain; unhe restore karo`},{en:`Wildcard exemptions cover banking automatically`,hi:`Wildcard exemptions banking ko apne aap cover karte hain`},{en:`Deep inspection cannot decrypt banking`,hi:`Deep inspection banking decrypt nahi kar sakta`}],a:1,w:{en:`Only update hosts are exempt, so banking would be decrypted. Restore the sensitive category exemptions and add a baseline check.`,hi:`Sirf update hosts exempt hain, isliye banking decrypt hogi. Sensitive category exemptions restore karo aur baseline check jodo.`}},{title:{en:`Guests on deep inspection`,hi:`Guests deep inspection par`},ticket:{en:`The guest Wi-Fi policy was copied from the staff policy. Guests report certificate warnings and a legal reviewer raises concerns. Policy excerpt (reference configuration, not run in the simulator).`,hi:`Guest Wi-Fi policy staff policy se copy hui thi. Guests certificate warnings report karte hain aur legal reviewer concerns uthata hai. Policy excerpt (reference configuration, simulator mein nahi chalaya).`},out:`! Reference configuration (not run in the simulator)
config firewall policy
    edit 20
        set name "GUEST-to-WAN"
        set srcintf "port3"
        set dstintf "port1"
        set action accept
        set utm-status enable
        set ssl-ssh-profile "NK-DEEP"
        set webfilter-profile "NK-WEB"
    next
end`,q:{en:`What should change?`,hi:`Kya badalna chahiye?`},o:[{en:`Add more antivirus profiles`,hi:`Aur antivirus profiles jodo`},{en:`Make the CA certificate download page public`,hi:`CA certificate download page public karo`},{en:`Use certificate-inspection for the guest policy and keep the web filter by name`,hi:`Guest policy ke liye certificate-inspection use karo aur naam se web filter rakho`},{en:`Disable the web filter`,hi:`Web filter disable karo`}],a:2,w:{en:`Guests are unmanaged and have not agreed to decryption. Certificate inspection avoids warnings and legal exposure while still filtering by site name.`,hi:`Guests unmanaged hain aur decryption par agree nahi hue. Certificate inspection warnings aur legal exposure se bachata hai aur phir bhi site naam se filter karta hai.`}},{title:{en:`Antivirus never fires`,hi:`Antivirus kabhi fire nahi hota`},ticket:{en:`Antivirus is attached but no malware has ever been detected, although users download many files over encrypted connections. Policy excerpt (reference configuration, not run in the simulator).`,hi:`Antivirus attached hai lekin kabhi malware detect nahi hua, jabki users encrypted connections par bahut files download karte hain. Policy excerpt (reference configuration, simulator mein nahi chalaya).`},out:`! Reference configuration (not run in the simulator)
config firewall policy
    edit 10
        set utm-status enable
        set ssl-ssh-profile "certificate-inspection"
        set av-profile "NK-AV"
    next
end`,q:{en:`Why does antivirus see nothing?`,hi:`Antivirus ko kuch kyun nahi dikhta?`},o:[{en:`The SSL profile does not decrypt, so encrypted files cannot be scanned`,hi:`SSL profile decrypt nahi karta, isliye encrypted files scan nahi ho sakti`},{en:`Antivirus only works on port 22`,hi:`Antivirus sirf port 22 par chalta hai`},{en:`The policy must use action deny`,hi:`Policy ka action deny hona chahiye`},{en:`The profile must be named default`,hi:`Profile ka naam default hona chahiye`}],a:0,w:{en:`Certificate inspection does not open the session. File scanning on encrypted downloads needs deep inspection.`,hi:`Certificate inspection session nahi kholta. Encrypted downloads par file scanning ke liye deep inspection chahiye.`}},{title:{en:`CPU high after rollout`,hi:`Rollout ke baad CPU high`},ticket:{en:`After enabling deep inspection for all staff, the FortiGate CPU stays high and video calls stutter. The profile has no category exemptions beyond banking. Policy excerpt (reference configuration, not run in the simulator).`,hi:`Saare staff ke liye deep inspection enable karne ke baad FortiGate CPU high rehta hai aur video calls atakte hain. Profile mein banking ke alawa koi category exemption nahi. Policy excerpt (reference configuration, simulator mein nahi chalaya).`},out:`! Reference configuration (not run in the simulator)
config firewall ssl-ssh-profile
    edit "NK-DEEP"
        config ssl-exempt
            edit 1
                set type fortiguard-category
                set fortiguard-category 31
            next
        end
    next
end`,q:{en:`Which change reduces load while keeping high-risk traffic inspected?`,hi:`Kaunsa change load kam karta hai aur high-risk traffic inspected rakhta hai?`},o:[{en:`Turn off all logging`,hi:`Saari logging band karo`},{en:`Switch every policy to no-inspection`,hi:`Har policy no-inspection par karo`},{en:`Delete the firewall policy`,hi:`Firewall policy delete karo`},{en:`Exempt bulk low-risk categories such as streaming video from decryption and size the hardware to SSL throughput`,hi:`Streaming video jaisi bulk low-risk categories ko decryption se exempt karo aur hardware SSL throughput ke hisaab se size karo`}],a:3,w:{en:`Most decrypted bytes are bulk video. Exempting it, and sizing for SSL inspection throughput, restores headroom without blinding the risky categories.`,hi:`Zyadatar decrypted bytes bulk video ke hain. Use exempt karna aur SSL inspection throughput ke hisaab se sizing headroom wapas deta hai bina risky categories ko andha kiye.`}}];export{e as default};