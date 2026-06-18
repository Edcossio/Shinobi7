package com.tiendatcg.ms_precios;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
@EnableDiscoveryClient
@EnableFeignClients
@SpringBootApplication
public class MsPreciosApplication {

	public static void main(String[] args) {
		SpringApplication.run(MsPreciosApplication.class, args);
	}

}
