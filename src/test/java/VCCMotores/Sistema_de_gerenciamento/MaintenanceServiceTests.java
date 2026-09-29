package VCCMotores.Sistema_de_gerenciamento;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import VCCMotores.Sistema_de_gerenciamento.entities.Maintenance;
import VCCMotores.Sistema_de_gerenciamento.entities.enums.MaintenanceStatus;
import VCCMotores.Sistema_de_gerenciamento.services.MaintenanceService;
import VCCMotores.Sistema_de_gerenciamento.services.exceptions.BusinessException;

@SpringBootTest
class MaintenanceServiceTests {

    @Autowired
    private MaintenanceService maintenanceService;
    
    @Test
    void shouldNotFinishMaintenanceWhenStatusIsOrcado() { //Testa se uma manutenção em ORCADO não pode ser finalizada diretamente.

        Maintenance maintenance = maintenanceService.findById(7L);

        maintenance.setStatus(MaintenanceStatus.FINALIZADO);

        assertThrows(BusinessException.class, () -> {
            maintenanceService.update(7L, maintenance);
        });
    }
    
    @Test
    void shouldFinishMaintenanceWhenStatusIsEmManutencao() { //Testa se uma manutenção em EM_MANUTENCAO pode ser finalizada.

        Maintenance maintenance = maintenanceService.findById(7L);

        maintenance.setStatus(MaintenanceStatus.EM_MANUTENCAO);
        maintenanceService.update(7L, maintenance);

        maintenance.setStatus(MaintenanceStatus.FINALIZADO);
        Maintenance result = maintenanceService.update(7L, maintenance);

        assertEquals(MaintenanceStatus.FINALIZADO, result.getStatus());
    }
}
